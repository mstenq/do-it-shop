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
  tenants,
  updateTenantSchema,
} from "@/server/db/tenant-schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTursoDB, createTursoToken, deleteTursoDB } from "./turso";

export const tenantRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return ctx.tenantDb.select().from(tenants);
  }),

  createTenant: protectedProcedure
    .input(insertTenantSchema)
    .mutation(async ({ ctx, input }) => {
      // Create record in shared tenant db
      const [record] = await ctx.tenantDb
        .insert(tenants)
        .values(input)
        .returning({ newId: tenants.id });
      if (!record?.newId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: "Could not create tenant record",
        });
      }

      // get database URL via turso api or simply generating a string for local dev
      let url = "";
      const isLocalFile = env.DATABASE_TENANT_URL.startsWith("file:");
      if (isLocalFile) {
        url = `file:db/tenant-${record.newId}.sqlite`;
      } else {
        const database = await createTursoDB(record.newId);
        url = `libsql://${database.Hostname}`;
      }

      // save url to shared tenants db
      await ctx.tenantDb
        .update(tenants)
        .set({ dbUrl: url })
        .where(eq(tenants.id, record.newId));

      // get authToken
      const authToken = isLocalFile
        ? undefined
        : await createTursoToken(record.newId);
      console.log({ authToken });
      const db = getDB({ url, authToken });
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
      await deleteTursoDB(input.id);
      await ctx.tenantDb.delete(tenants).where(eq(tenants.id, input.id));
    }),
});
