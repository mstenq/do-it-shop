import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

export function getDB({ url, authToken }: { url: string; authToken?: string }) {
  if (url === undefined) {
    throw new Error("db url is not defined");
  }

  return drizzle(createClient({ url, authToken }), {
    schema,
  });
}

export type DB = ReturnType<typeof getDB>;
