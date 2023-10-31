import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { tenantAccess, users } from "@/server/db/tenant-schema";
import { decrypt, verifyPassword } from "@/server/utils";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const [user, access] = await Promise.all([
        ctx.tenantDb.query.users.findFirst({
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            updatedAt: true,
          },
          where: eq(users.id, Number(input)),
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
        }),
      ]);

      return { ...user, tenantAccess: access };
    }),

  login: publicProcedure
    .input(
      z.object({
        tenantId: z.number().optional(),
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
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

      // decrypt all tenantAccess.accessTokenHash
      const decryptedTenantAccess = user?.tenantAccess.map((access) => {
        return {
          ...access,
          authToken: decrypt(access.accessTokenHash, user.id, access.iv),
        };
      });
    }),
});
