import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const address = v.object({
  street: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  zipCode: v.optional(v.string()),
  country: v.optional(v.string()),
});

export const employeeType = v.union(
  v.literal("hourly"),
  v.literal("salary"),
  v.literal("piece-work")
);

export const tableName = v.union(
  v.literal("employees"),
  v.literal("paySchedule"),
  v.literal("times"),
  v.literal("customers")
);

export default defineSchema({
  customers: defineTable({
    name: v.string(),
    address: v.optional(address),
    notes: v.optional(v.string()),

    // Standard fields
    isDeleted: v.optional(v.boolean()),
    searchIndex: v.optional(v.string()),
  }).searchIndex("search", {
    searchField: "searchIndex",
    filterFields: ["isDeleted"],
  }),

  employees: defineTable({
    nameFirst: v.string(),
    nameLast: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    isActive: v.boolean(),
    type: employeeType,
    currentDailyHours: v.optional(v.number()), // calculated in trigger
    currentWeekHours: v.optional(v.number()), // calculated in trigger
    currentPayPeriodHours: v.optional(v.number()), // calculated in trigger

    // system fields
    searchIndex: v.optional(v.string()),
    isDeleted: v.boolean(),
    filemakerId: v.optional(v.string()),
    modificationTime: v.number(),
  })
    .index("by_active_type", ["isActive", "type"])
    .index("by_type", ["type"])
    .searchIndex("search", {
      searchField: "searchIndex",
      filterFields: ["isDeleted"],
    }),

  paySchedule: defineTable({
    name: v.string(),
    payPeriod: v.number(),
    year: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    searchIndex: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_startDate", ["startDate"])
    .searchIndex("search", {
      searchField: "searchIndex",
    }),

  times: defineTable({
    employeeId: v.id("employees"),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    totalTime: v.optional(v.number()), // calculated in trigger

    filemakerId: v.optional(v.string()),
  })
    .index("by_startTime", ["startTime"])
    .index("by_employeeId_startTime", ["employeeId", "startTime"]),

  // Temp tables
  fmEmployees: defineTable({
    email: v.string(),
    filemakerId: v.string(),
    nameFirst: v.string(),
    nameLast: v.string(),
    phoneNumber: v.string(),
    isActive: v.boolean(),
    type: employeeType,
  }).index("by_filemakerId", ["filemakerId"]),

  fmTimes: defineTable({
    employeeFilemakerId: v.string(),
    endTime: v.number(),
    startTime: v.number(),
    totalTime: v.float64(),
    filemakerId: v.string(),
  }).index("by_employeeFilemakerId", ["employeeFilemakerId"]),
});
