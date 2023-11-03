import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { insertProjectSchema, projects } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const projectsRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.projects.findMany();
  }),
  create: protectedProcedure
    .input(insertProjectSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(projects).values(input).returning();
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(projects).where(eq(projects.id, input)).returning();
    }),
});
