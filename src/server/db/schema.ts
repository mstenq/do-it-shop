import dayjs from "@/libs/dayjs";
import { isSameOrAfterDate } from "@/utils/zodRefinements";
import { sql, relations } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
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

/**
 * ROLES
 */
export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  role: text("role"), // e.g. "admin", "user", "guest"
  description: text("description"),

  createdAt: integer("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const roleRelations = relations(roles, ({ many }) => ({
  pemissions: many(permissions),
}));

export const insertRolesSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type RoleInsert = z.infer<typeof insertRolesSchema>;

export const updateUserSchema = createInsertSchema(roles)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export type Role = typeof roles.$inferSelect;

/**
 * PERMISSIONS
 */
export const permissions = sqliteTable(
  "permissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roleId: integer("role_id")
      .references(() => roles.id)
      .notNull(),
    table: text("table").notNull(),
    view: integer("view", { mode: "boolean" }).notNull().default(false),
    edit: integer("edit", { mode: "boolean" }).notNull().default(false),
    create: integer("create", { mode: "boolean" }).notNull().default(false),
    delete: integer("delete", { mode: "boolean" }).notNull().default(false),
    editOthers: integer("edit_others", { mode: "boolean" })
      .notNull()
      .default(false),
    deleteOthers: integer("delete_others", { mode: "boolean" })
      .notNull()
      .default(false),
    additionalPermissions: text("additional_permissions", {
      mode: "json",
    }).$type<Record<string, boolean>>(),
    createdAt: integer("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (permissions) => ({
    roleId: index("role_idx").on(permissions.roleId),
  }),
);

export const insertPermissionsSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePermissionsSchema = insertPermissionsSchema.partial();

export type PermissionsInsert = z.infer<typeof insertPermissionsSchema>;
export type Permission = typeof permissions.$inferSelect;
