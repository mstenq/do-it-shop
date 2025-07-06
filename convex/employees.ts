import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getCurrentPayPeriodInfo } from "./payScheduleUtils";
import { employeeType } from "./schema";
import {
  calculateEmployeeHours,
  getMostRecentOpenTimeRecord,
  getStartOfTodayMDT,
} from "./timeUtils";
import { internalMutation } from "./triggers";
import { authMutation, authQuery, joinData, NullP } from "./utils";

/**
 * Queries
 */

export const all = authQuery({
  args: {
    includeDeleted: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    type: v.optional(employeeType),
  },
  handler: async (ctx, args) => {
    console.log("Fetching all employees with args:", args);
    const getQuery = () => {
      // filter by active status if requested
      if (args.isActive && args.type) {
        console.log(
          "Filtering by isActive and type:",
          args.isActive,
          args.type
        );
        return ctx.db
          .query("employees")
          .withIndex("by_active_type", (q) =>
            q.eq("isActive", true).eq("type", args.type!)
          );
      }

      // filter by isActive if requested
      if (args.isActive) {
        console.log("Filtering by isActive:", args.isActive);
        return ctx.db
          .query("employees")
          .withIndex("by_active_type", (q) => q.eq("isActive", true));
      }

      // filter by type if requested
      if (args.type) {
        console.log("Filtering by type:", args.type);
        return ctx.db
          .query("employees")
          .withIndex("by_type", (q) => q.eq("type", args.type!));
      }

      return ctx.db.query("employees");
    };

    const employees = await getQuery().collect();
    console.log("Fetched employees:", employees.length);

    // Filter out deleted employees unless explicitly requested
    const filteredEmployees = !args.includeDeleted
      ? employees.filter((employee) => !employee.isDeleted)
      : employees;

    // sort by name
    const sortedEmployees = filteredEmployees.sort((a, b) => {
      const nameA = `${a.nameFirst} ${a.nameLast}`.toLowerCase();
      const nameB = `${b.nameFirst} ${b.nameLast}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // Join related data
    const joinedEmployees = await joinData(sortedEmployees, {
      photo: (record) =>
        record.photoStorageId
          ? ctx.storage.getUrl(record.photoStorageId)
          : NullP,
      mostRecentOpenTime: async (record) => {
        // Get start of today timestamp
        const startOfToday = getStartOfTodayMDT().getTime();

        // Find the most recent open time record for this employee
        return await getMostRecentOpenTimeRecord(ctx, record._id, startOfToday);
      },
    });

    return joinedEmployees;
  },
});

export const get = authQuery({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    if (!args.id) {
      return null;
    }
    const employee = await ctx.db.get(args.id as Id<"employees">);

    if (!employee) {
      return null;
    }

    // Join related data
    const [joinedEmployee] = await joinData([employee], {
      photo: (record) =>
        record.photoStorageId
          ? ctx.storage.getUrl(record.photoStorageId)
          : NullP,
    });

    return joinedEmployee;
  },
});

const commonArgs = {
  nameFirst: v.optional(v.string()),
  nameLast: v.optional(v.string()),
  photoStorageId: v.optional(v.id("_storage")),
  phoneNumber: v.optional(v.string()),
  email: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
  type: v.optional(employeeType),
};

/**
 * Mutations
 */
export const add = authMutation({
  args: {
    ...commonArgs,
    nameFirst: v.string(), // Required field
    nameLast: v.string(), // Required field
    type: employeeType, // Required field
  },
  handler: async (ctx, args) => {
    const newEmployee = await ctx.db.insert("employees", {
      ...args,
      isDeleted: false,
      isActive: true,
      modificationTime: new Date().getTime(),
    });

    return newEmployee;
  },
});

export const update = authMutation({
  args: {
    id: v.id("employees"),
    ...commonArgs,
  },
  handler: async (ctx, { id, ...args }) => {
    await ctx.db.patch(id, {
      ...args,
      modificationTime: new Date().getTime(),
    });
    return;
  },
});

export const destroy = authMutation({
  args: { ids: v.array(v.id("employees")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.patch(id, { isDeleted: true, isActive: false });
    }
    return args.ids;
  },
});

export const restore = authMutation({
  args: { ids: v.array(v.id("employees")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.patch(id, { isDeleted: false });
    }
    return args.ids;
  },
});

export const calculateAllEmployeeHours = internalMutation({
  args: {},
  handler: async (ctx) => {
    // get all active employees
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_active_type", (q) => q.eq("isActive", true))
      .collect();

    // calculate hours for each employee
    let timeout = 1000;
    for (const employee of employees) {
      await ctx.scheduler.runAfter(timeout, internal.employees.calculateHours, {
        id: employee._id,
      });
      timeout += 1000; // stagger the calculations to avoid overload
    }

    return employees.map((e) => e._id);
  },
});

export const calculateHours = internalMutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    console.log(`Calculating hours for employee ${args.id}`);

    // Get current pay period info
    const payPeriod = getCurrentPayPeriodInfo();
    console.log(payPeriod);

    // Calculate all hours using the utility function
    const hours = await calculateEmployeeHours(
      ctx,
      args.id,
      payPeriod.startDate.getTime(),
      payPeriod.endDate.getTime()
    );

    console.log(
      `Calculated hours for employee ${args.id}:`,
      `Daily: ${hours.currentDailyHours},`,
      `Pay Period (${payPeriod.name}): ${hours.currentPayPeriodHours},`,
      `Week: ${hours.currentWeekHours}`
    );

    // Update employee with calculated hours
    await ctx.db.patch(args.id, hours);
  },
});

export const triggerSearchIndexUpdate = internalMutation({
  args: {},
  handler: async (ctx) => {
    // get all active employees
    const employees = await ctx.db.query("employees").collect();

    for (const employee of employees) {
      await ctx.db.patch(employee._id, {
        modificationTime: new Date().getTime(),
      });
    }
  },
});
