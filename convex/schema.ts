import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const address = v.object({
  street: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  zip: v.optional(v.string()),
  country: v.optional(v.string()),
});

export const groups = v.union(
  v.literal("states"),
  v.literal("cities"),
  v.literal("jobDescriptions")
);

export const employeeType = v.union(
  v.literal("hourly"),
  v.literal("salary"),
  v.literal("piece-work")
);

export const jobPriority = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low")
);

export const jobStatus = v.union(
  v.literal("ready"),
  v.literal("waiting"),
  v.literal("in-progress"),
  v.literal("back-burner"),
  v.literal("completed")
);

export const tableName = v.union(
  v.literal("employees"),
  v.literal("paySchedule"),
  v.literal("times"),
  v.literal("customers"),
  v.literal("jobs")
);

export default defineSchema({
  customers: defineTable({
    name: v.string(),
    address: v.optional(address),
    notes: v.optional(v.string()),
    website: v.optional(v.string()),

    // Standard fields
    isDeleted: v.boolean(),
    searchIndex: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .searchIndex("search", {
      searchField: "searchIndex",
      filterFields: ["isDeleted"],
    })
    .searchIndex("searchCustomerName", {
      searchField: "name",
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

  jobs: defineTable({
    customerId: v.id("customers"),
    description: v.string(),
    notes: v.optional(v.string()),
    employeeId: v.optional(v.id("employees")),
    dueDate: v.optional(v.number()),
    priority: jobPriority,
    status: jobStatus,
    isCompleted: v.boolean(), // trigger will set this based on stage
    quantity: v.optional(v.string()),

    // Standard fields
    isDeleted: v.boolean(),
    searchIndex: v.optional(v.string()),
  })
    .index("by_isCompleted", ["isCompleted"])
    .searchIndex("search", {
      searchField: "searchIndex",
      filterFields: ["isDeleted"],
    }),

  valueLists: defineTable({
    group: groups,
    value: v.string(),
  })
    .index("by_group_value", ["group", "value"])
    .searchIndex("search", {
      searchField: "value",
      filterFields: ["group"],
    }),

  // Temp import tables
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
