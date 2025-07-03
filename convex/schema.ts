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
  v.literal("positions")
);

export default defineSchema({
  employees: defineTable({
    id: v.string(),
    nameFirst: v.string(),
    nameLast: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    sourceVendorId: v.optional(v.id("vendors")),
    positionIds: v.optional(v.array(v.id("positions"))),
    department: v.optional(v.string()),
    level: v.optional(v.string()),
    grade: v.optional(v.string()),
    address: v.optional(address),
    driversLicenseNumber: v.optional(v.string()),
    driversLicenseExpDate: v.optional(v.string()),
    searchIndex: v.optional(v.string()),
    isDeleted: v.optional(v.boolean()),
  }).searchIndex("search", {
    searchField: "searchIndex",
    filterFields: ["isDeleted"],
  }),

  positions: defineTable({
    id: v.string(),
    name: v.string(),
    schedulerColor: v.string(),
    isDeleted: v.optional(v.boolean()),
  }),

  incrementors: defineTable({
    tableName: tableName,
    nextAvailableId: v.number(),
  }).index("by_tableName", ["tableName"]),
});
