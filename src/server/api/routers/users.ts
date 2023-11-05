import { env } from "@/env.mjs";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  tenantAccessMiddleware,
} from "@/server/api/trpc";
import { tenantAccess, users } from "@/server/db/tenant-schema";
import { verifyPassword } from "@/server/utils";
import {
  createNewUserMutation,
  createUserSchema,
} from "@/server/utils/createNewUser";
import { createUserSession } from "@/server/utils/userSession";
import { TRPCError } from "@trpc/server";
import { eq, sql, desc, asc } from "drizzle-orm";
import { z } from "zod";

const devWait = async (ms: number) => {
  if (env.NODE_ENV !== "development") {
    return;
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const sortOptions = {
  name: [users.firstName, users.lastName],
  email: [users.email],
  role: [users.role, users.firstName],
  lastUpdated: [users.updatedAt],
};
export const SortUser = z.enum(["name", "email", "role", "lastUpdated"]);
export const SortDirection = z.enum(["asc", "desc"]);
export const userRouter = createTRPCRouter({
  all: protectedProcedure
    .input(
      z.object({
        limit: z.number().positive(),
        skip: z.number(),
        sortBy: SortUser.default("name"),
        sortDirection: SortDirection.default("asc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      await devWait(1000);

      const orderBy = sortOptions[input.sortBy].map((col) =>
        input.sortDirection === "asc" ? asc(col) : desc(col),
      );

      const [allResults, results] = await Promise.all([
        ctx.tenantDb
          .select({
            found: sql<number>`COUNT(*)`,
          })
          .from(users)
          .innerJoin(tenantAccess, eq(tenantAccess.userId, users.id))
          .where(eq(tenantAccess.tenantId, ctx.session.currentTenantId)),

        ctx.tenantDb
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
            email: users.email,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          })
          .from(users)
          .innerJoin(tenantAccess, eq(tenantAccess.userId, users.id))
          .where(eq(tenantAccess.tenantId, ctx.session.currentTenantId))
          .orderBy(...orderBy)
          .limit(input.limit)
          .offset(input.skip),
      ]);
      return {
        totalFound: allResults?.[0]?.found ?? 0,
        users: results,
      };
    }),

  get: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const [user, access] = await Promise.all([
      ctx.tenantDb.query.users.findFirst({
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
        where: eq(users.id, input),
      }),
      ctx.tenantDb.query.tenantAccess.findMany({
        columns: {
          id: true,
          createdAt: true,
          updatedAt: true,
          tenantId: true,
          userId: true,
          accessTokenHash: true,
        },
        where: eq(tenantAccess.userId, Number(input)),
        with: {
          tenant: true,
        },
      }),
    ]);

    return { ...user, tenantAccess: access };
  }),

  create: protectedProcedure
    .input(createUserSchema)
    .use(tenantAccessMiddleware)
    .mutation(createNewUserMutation),

  login: publicProcedure
    .input(
      z.object({
        tenantId: z.number().optional(),
        email: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.tenantDb.query.users.findFirst({
        where: eq(users.email, input.email),
        with: {
          tenantAccess: true,
        },
      });

      // Check for user
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Confirm password is correct
      if (!verifyPassword(input.password, user.salt, user.passwordHash)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        });
      }

      // Create User Session
      await createUserSession(user.id, input.tenantId);
    }),

  switchTenant: protectedProcedure
    .input(z.object({ tenantId: z.number() }))
    .use(tenantAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      await createUserSession(ctx.session.user.id, input.tenantId);
      return { id: input.tenantId };
    }),
});
