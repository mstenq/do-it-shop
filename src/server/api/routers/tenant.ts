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
} from "@/server/db/tenant-schema";
import { createNewUserMutation } from "@/server/utils/createNewUser";
import { isLocalFile } from "@/server/utils/isLocalFile";
import { createUserSession } from "@/server/utils/userSession";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import fs from "fs";
import { z } from "zod";
import { createTursoDB, createTursoToken, deleteTursoDB } from "./turso";
import { encrypt } from "@/server/utils";

export const tenantRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.tenantDb.select().from(tenants);
  }),

  getById: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    return ctx.tenantDb.query.tenants.findFirst({
      where: eq(tenants.id, input),
    });
  }),

  create: protectedProcedure
    .input(insertTenantSchema)
    .mutation(async ({ ctx, input }) => {
      const [newTenant] = await ctx.tenantDb
        .insert(tenants)
        .values(input)
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

      // Create tenantAccess record to store token
      const { encrypted: accessTokenHash, iv } = encrypt(
        authToken,
        ctx.session.user.id,
      );
      await ctx.tenantDb.insert(tenantAccess).values({
        userId: ctx.session.user.id,
        tenantId: newTenant.id,
        iv,
        accessTokenHash,
      });

      // Migrate new db
      const db = getDB({ url, authToken });
      await dbMigrate(db);

      // Update session so new tenant is selected
      await createUserSession(ctx.session.user.id, newTenant.id);

      return newTenant;
    }),

  register: publicProcedure
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

      const { newUser, authToken } = await createNewUserMutation({
        ctx,
        input: {
          tenantId: newTenant.id,
          user: input.user,
          password: input.password,
        },
      });

      // Migrate new db
      const db = getDB({ url, authToken });
      await dbMigrate(db);

      await createUserSession(newUser.id, newTenant.id);

      return { tenant: newTenant, user: newUser };
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
