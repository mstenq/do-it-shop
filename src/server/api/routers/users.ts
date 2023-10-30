import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { tenantAccess, users } from "@/server/db/tenant-schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getUser: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const user = await ctx.tenantDb.query.users.findFirst({
      where: eq(users.id, Number(input)),
    });
    const access = await ctx.tenantDb.query.tenantAccess.findMany({
      where: eq(tenantAccess.userId, Number(input)),
    });

    return { ...user, tenantAccess: access };
  }),
});
