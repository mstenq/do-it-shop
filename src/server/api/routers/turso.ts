import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import { cwd } from "process";
import { z } from "zod";
import fs from "fs";
import { env } from "@/env.mjs";
import { dbMigrate } from "@/server/db/db-migrate";

const tursoFetch = async (url: string, options?: RequestInit) => {
  const res = await fetch(`${env.TURSO_API_URL}${url}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${env.TURSO_API_TOKEN}`,
    },
  });
  const data = (await res.json()) as unknown;
  return data;
};

/**
 * FUNCTIONS
 */
const createTursoDBResponseSchema = z.object({
  database: z.object({
    DbId: z.string(),
    Hostname: z.string(),
  }),
});

export const createTursoDB = async (id: number) => {
  const raw = await tursoFetch(
    `/v1/organizations/${env.TURSO_APP_ORGANIZATION}/databases`,
    {
      method: "POST",
      body: JSON.stringify({
        name: `tenant-${id}`,
        group: `do-it-shop`,
        location: `ord`,
      }),
    },
  );
  const { database } = createTursoDBResponseSchema.parse(raw);
  return database;
};

export const deleteTursoDB = async (id: number) => {
  await tursoFetch(
    `/v1/organizations/${env.TURSO_APP_ORGANIZATION}/databases/tenant-${id}`,
    {
      method: "DELETE",
    },
  );
};

const createTursoTokenResponseSchema = z.object({
  jwt: z.string(),
});

export const createTursoToken = async (id: number) => {
  const raw = await tursoFetch(
    `/v1/organizations/${env.TURSO_APP_ORGANIZATION}/databases/tenant-${id}/auth/tokens`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
  const { jwt } = createTursoTokenResponseSchema.parse(raw);
  return jwt;
};

/**
 * ROUTER
 */

export const tursoRouter = createTRPCRouter({
  createDB: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => createTursoDB(input.id)),

  createDBAuthToken: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => createTursoToken(input.id)),

  currentDBVersion: protectedProcedure.query(async ({ ctx }) => {
    try {
      const dbVersionQuery = await ctx.db.get(
        sql`SELECT count(*) as version FROM "__drizzle_migrations"`,
      );

      const parsedDbVersion = z
        .object({ version: z.number() })
        .safeParse(dbVersionQuery);

      if (!parsedDbVersion.success) {
        return null;
      }

      return parsedDbVersion.data.version;
    } catch (e) {
      console.log(e);
      return null;
    }
  }),

  latestDBVersion: protectedProcedure.query(() => {
    console.log("CWD", cwd());
    try {
      const file = fs.readFileSync(
        cwd() + "/public/migrations/meta/_journal.json",
        "utf-8",
      );

      const parsedFile = z
        .object({ entries: z.array(z.object({ idx: z.number() })) })
        .safeParse(JSON.parse(file));

      if (!parsedFile.success) {
        return null;
      }
      return parsedFile.data.entries.length;
    } catch (e) {
      console.log(e);
      return null;
    }
  }),

  migrateDB: protectedProcedure.mutation(async ({ ctx }) => {
    return await dbMigrate(ctx.db);
  }),
});
