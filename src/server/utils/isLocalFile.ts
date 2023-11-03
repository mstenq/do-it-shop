import { env } from "@/env.mjs";

export const isLocalFile = env.DATABASE_TENANT_URL.startsWith("file:");
