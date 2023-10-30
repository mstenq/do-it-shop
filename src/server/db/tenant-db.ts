import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./tenant-schema";

import { env } from "@/env.mjs";

export function getTenantDB() {
  const url = env.DATABASE_TENANT_URL;
  if (url === undefined) {
    throw new Error("DATABASE_TENANT_URL is not defined");
  }

  const authToken = env.DATABASE_AUTH_TOKEN;
  if (authToken === undefined) {
    throw new Error("DATABASE_AUTH_TOKEN is not defined");
  }

  return drizzle(createClient({ url, authToken }), { schema });
}
