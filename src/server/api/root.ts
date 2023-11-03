import { postRouter } from "@/server/api/routers/post";
import { createTRPCRouter } from "@/server/api/trpc";
import { tenantRouter } from "./routers/tenant";
import { tursoRouter } from "./routers/turso";
import { userRouter } from "./routers/users";
import { tenantAccessRouter } from "./routers/tenantAccess";
import { projectsRouter } from "./routers/projects";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  projects: projectsRouter,
  tenant: tenantRouter,
  tenantAccess: tenantAccessRouter,
  turso: tursoRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
