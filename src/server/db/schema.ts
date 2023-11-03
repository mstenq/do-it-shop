import dayjs from "@/libs/dayjs";
import { isSameOrAfterDate } from "@/utils/zodRefinements";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * PROJECTS
 */
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectName: text("project_name").notNull(),
  description: text("description"),
  dueDate: text("due_date"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const insertProjectSchema = createInsertSchema(projects, {
  dueDate: z
    .string()
    .refine(...isSameOrAfterDate(dayjs(), "Due date must be in the future")),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Project = typeof projects.$inferSelect;

/**
 * CLIENTS
 */
export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("company_name"),
  photo: text("photo"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Client = typeof clients.$inferSelect;
