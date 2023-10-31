import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

/**
 * TENANTS
 */
export const tenants = sqliteTable(
  "tenants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    companyName: text("company_name").notNull(),
    dbUrl: text("db_url"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (tenants) => ({
    nameIdx: index("name_idx").on(tenants.companyName),
  }),
);

export const tenantRelations = relations(tenants, ({ many }) => ({
  tenantAccess: many(tenantAccess),
}));

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTenantSchema = createInsertSchema(tenants)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export type Tenant = typeof tenants.$inferSelect;

/**
 * USERS
 */
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    salt: text("salt").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (users) => ({
    emailIdx: uniqueIndex("email_idx").on(users.email),
  }),
);

export const userRelations = relations(users, ({ many }) => ({
  tenantAccess: many(tenantAccess),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  salt: true,
  passwordHash: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    salt: true,
    passwordHash: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export type User = typeof users.$inferSelect;

/**
 * TENANT_ACCESS
 */
export const tenantAccess = sqliteTable(
  "tenant_access",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tenantId: integer("tenant_id").references(() => tenants.id),
    userId: integer("user_id").references(() => users.id),
    iv: text("iv").notNull(),
    accessTokenHash: text("access_token_hash").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (tenantAccess) => ({
    tenantId: index("tenant_idx").on(tenantAccess.tenantId),
    userId: index("user_idx").on(tenantAccess.userId),
    uniqueTenantAndUser: uniqueIndex("tenant_user_idx").on(
      tenantAccess.tenantId,
      tenantAccess.userId,
    ),
  }),
);

export const tenantAccessRelations = relations(tenantAccess, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantAccess.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantAccess.userId],
    references: [users.id],
  }),
}));

export const insertTenantAccessSchema = createInsertSchema(tenantAccess).omit({
  id: true,
  iv: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTenantAccessSchema = createInsertSchema(tenantAccess)
  .omit({
    id: true,
    iv: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export type TenantAccess = typeof tenantAccess.$inferSelect;
