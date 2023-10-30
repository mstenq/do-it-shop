import { env } from "@/env.mjs";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { getDB } from "@/server/db/db";
import { dbMigrate } from "@/server/db/db-migrate";
import {
  insertTenantSchema,
  insertUserSchema,
  tenantAccess,
  tenants,
  updateTenantSchema,
  users,
} from "@/server/db/tenant-schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTursoDB, createTursoToken, deleteTursoDB } from "./turso";
import fs from "fs";
import { cookies } from "next/headers";
import { decrypt, encrypt, hashPassword } from "@/server/utils";

const isLocalFile = env.DATABASE_TENANT_URL.startsWith("file:");

export const tenantRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.tenantDb.select().from(tenants);
  }),

  createTenant: protectedProcedure
    .input(
      z.object({
        tenant: insertTenantSchema,
        user: insertUserSchema,
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create record in shared tenant db
      const [newTenant] = await ctx.tenantDb
        .insert(tenants)
        .values(input.tenant)
        .returning({ id: tenants.id });

      if (!newTenant?.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: "Could not create tenant record",
        });
      }

      // get database URL via turso api or simply generating a string for local dev
      let url = "";

      if (isLocalFile) {
        url = `file:db/tenant-${newTenant.id}.sqlite`;
      } else {
        const database = await createTursoDB(newTenant.id);
        url = `libsql://${database.Hostname}`;
      }

      // save url to shared tenants db
      await ctx.tenantDb
        .update(tenants)
        .set({ dbUrl: url })
        .where(eq(tenants.id, newTenant.id));

      // get authToken
      const authToken = isLocalFile ? "" : await createTursoToken(newTenant.id);
      const db = getDB({ url, authToken });

      // Creat user record in global shared DB
      const passwordHash = hashPassword(input.password, newTenant.id);
      const [newUser] = await ctx.tenantDb
        .insert(users)
        .values({ ...input.user, passwordHash, salt: `${newTenant.id}` })
        .returning({ id: users.id });

      if (!newUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: "Could not create user record",
        });
      }

      // Create tenantAccess record to store hashed token
      const { encrypted: accessTokenHash, iv } = encrypt(
        authToken,
        input.password,
      );
      await ctx.tenantDb.insert(tenantAccess).values({
        userId: newUser.id,
        tenantId: newTenant.id,
        iv,
        accessTokenHash,
      });

      // Migrate new db
      await dbMigrate(db);
    }),

  updateTenant: protectedProcedure
    .input(z.object({ id: z.number(), data: updateTenantSchema }))
    .mutation(async ({ ctx, input }) => {
      await ctx.tenantDb
        .update(tenants)
        .set(input.data)
        .where(eq(tenants.id, input.id));
    }),

  deleteTenant: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (isLocalFile) {
        fs.unlinkSync(`db/tenant-${input.id}.sqlite`);
      } else {
        await deleteTursoDB(input.id);
      }
      await ctx.tenantDb.delete(tenants).where(eq(tenants.id, input.id));
    }),
});
