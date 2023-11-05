import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { tenantAccess } from "@/server/db/tenant-schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const tenantAccessRouter = createTRPCRouter({
  /**TODO - this should not be public */
  getByTenantId: publicProcedure
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
