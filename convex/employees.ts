import { convexToJson, v } from "convex/values";
import { internal } from "./_generated/api";
import { authMutation, authQuery, joinData, NullP } from "./utils";
import { Id } from "./_generated/dataModel";
import { employeeType } from "./schema";
import { internalMutation } from "./_generated/server";
import { getCurrentPayPeriodInfo } from "./payScheduleUtils";

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
        // Get start of today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfToday = today.getTime();

        // Find the most recent time record for this employee without endTime
        // and with a date >= start of today
        const openTime = await ctx.db
          .query("times")
          .withIndex("by_employeeId_date", (q) =>
            q.eq("employeeId", record._id).gte("date", startOfToday)
          )
          .filter((q) => q.eq(q.field("endTime"), undefined))
          .first();

        return openTime;
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
    // calculate hours for today
    console.log(`Calculating hours for employee ${args.id}`);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const todayTimes = await ctx.db
      .query("times")
      .withIndex("by_employeeId_date", (q) =>
        q
          .eq("employeeId", args.id)
          .gte("date", startOfToday.getTime())
          .lte("date", endOfToday.getTime())
      )
      .filter((q) => q.neq(q.field("endTime"), undefined))
      .collect();
    const currentTodayHours = todayTimes.reduce((sum, record) => {
      return sum + (record.totalTime ?? 0);
    }, 0);

    // get current pay period
    const payPeriod = getCurrentPayPeriodInfo();
    const startDate = payPeriod.startDate.getTime();
    const endDate = payPeriod.endDate.getTime();

    // get all time entries for this employee in the current pay period
    const times = await ctx.db
      .query("times")
      .withIndex("by_employeeId_date", (q) =>
        q.eq("employeeId", args.id).gte("date", startDate).lte("date", endDate)
      )
      .filter((q) => q.neq(q.field("endTime"), undefined))
      .collect();

    // calculate total hours
    const totalHours = times.reduce((sum, record) => {
      return sum + (record.totalTime ?? 0);
    }, 0);
    console.log(
      `Calculated ${totalHours} hours for employee ${args.id} in pay period ${payPeriod.name}`
    );

    // get time entries for current week
    const currentWeekStart = new Date();
    currentWeekStart.setDate(
      currentWeekStart.getDate() - currentWeekStart.getDay()
    );
    currentWeekStart.setHours(0, 0, 0, 0);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);
    const currentWeekTimes = await ctx.db
      .query("times")
      .withIndex("by_employeeId_date", (q) =>
        q
          .eq("employeeId", args.id)
          .gte("date", currentWeekStart.getTime())
          .lte("date", currentWeekEnd.getTime())
      )
      .filter((q) => q.neq(q.field("endTime"), undefined))
      .collect();
    const currentWeekHours = currentWeekTimes.reduce((sum, record) => {
      return sum + (record.totalTime ?? 0);
    }, 0);

    console.log(
      `Calculated ${currentWeekHours} hours for employee ${args.id} in current week`
    );

    // Update employee with calculated hours
    await ctx.db.patch(args.id, {
      currentDailyHours: currentTodayHours,
      currentPayPeriodHours: totalHours,
      currentWeekHours: currentWeekHours,
    });
  },
});
