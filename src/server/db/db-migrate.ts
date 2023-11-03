import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { DB } from "./db";

export async function dbMigrate(db: DB) {
  try {
    await migrate(db, {
      migrationsFolder: "public/migrations",
    });
    console.log("Tables migrated!");
    return { ok: true };
  } catch (error) {
    console.error("Error performing migration: ", error);
    return { ok: false, error };
  }
}
