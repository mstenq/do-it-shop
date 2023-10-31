import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { tenantAccess } from "@/server/db/tenant-schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const tenantAccessRouter = createTRPCRouter({
  getByTenantId: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.tenantDb.query.tenantAccess.findMany({
        where: eq(tenantAccess.tenantId, input),
        with: {
          user: true,
          tenant: true,
        },
      });
    }),
});
