import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const address = v.object({
  street: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  zipCode: v.optional(v.string()),
  country: v.optional(v.string()),
});

export const tableName = v.union(
  v.literal("employees"),
  v.literal("paySchedule")
);

export default defineSchema({
  employees: defineTable({
    id: v.string(),
    nameFirst: v.string(),
    nameLast: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    searchIndex: v.optional(v.string()),
    isDeleted: v.optional(v.boolean()),
  }).searchIndex("search", {
    searchField: "searchIndex",
    filterFields: ["isDeleted"],
  }),

  paySchedule: defineTable({
    id: v.string(),
    name: v.string(),
    payPeriod: v.number(),
    year: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    searchIndex: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .searchIndex("search", {
      searchField: "searchIndex",
    }),

  incrementors: defineTable({
    tableName: tableName,
    nextAvailableId: v.number(),
  }).index("by_tableName", ["tableName"]),
});
