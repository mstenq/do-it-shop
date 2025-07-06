import { v } from "convex/values";
import { internal } from "./_generated/api";
import { authMutation, authQuery, joinData, NullP, parseDate } from "./utils";
import { Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import {
  getStartOfTodayMDT,
  getCurrentTimeHHMM,
  timesDateRangeQuery,
  timesEmployeeAndDateRangeQuery,
} from "./timeUtils";

/**
 * Re-export query functions for backward compatibility
 */
export { timesDateRangeQuery, timesEmployeeAndDateRangeQuery };

/**
 * Queries
 */

export const all = authQuery({
  args: {
    employeeId: v.optional(v.id("employees")),
    dateRange: v.optional(
      v.object({
        start: v.optional(v.number()),
        end: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    console.log("Fetching all times with args:", args);
    const query = args.employeeId
      ? timesEmployeeAndDateRangeQuery(
          ctx,
          args.employeeId,
          args.dateRange?.start,
          args.dateRange?.end
        )
      : timesDateRangeQuery(ctx, args.dateRange?.start, args.dateRange?.end);

    const results = await query.collect();

    // Join related data if needed
    const joinedRecords = await joinData(results, {
      employee: (r) => (r.employeeId ? ctx.db.get(r.employeeId) : NullP),
    });

    return joinedRecords;
  },
});

export const get = authQuery({
  args: { _id: v.string() },
  handler: async (ctx, args) => {
    if (!args._id) {
      return null;
    }
    const record = await ctx.db.get(args._id as Id<"times">);

    if (!record) {
      return null;
    }

    // Join related data if needed
    const [joinedRecord] = await joinData([record], {
      // employee: (record) => record.employeeId ? ctx.db.get(record.employeeId) : NullP,
    });

    return joinedRecord;
  },
});

const commonArgs = {
  employeeId: v.optional(v.id("employees")),
  startTime: v.optional(v.number()),
  endTime: v.optional(v.number()),
};

/**
 * Mutations
 */
export const add = authMutation({
  args: {
    ...commonArgs,
    employeeId: v.id("employees"),
    startTime: v.number(),
    // endTime is optional
  },
  handler: async (ctx, args) => {
    const newTime = await ctx.db.insert("times", {
      ...args,
      // totalTime will be calculated in trigger
    });

    return newTime;
  },
});

export const update = authMutation({
  args: {
    _id: v.id("times"),
    ...commonArgs,
  },
  handler: async (ctx, { _id, ...args }) => {
    await ctx.db.patch(_id, {
      ...args,
    });
    return;
  },
});

export const clockIn = authMutation({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const newTime = await ctx.db.insert("times", {
      employeeId: args.employeeId,
      startTime: new Date().getTime(),
    });

    return newTime;
  },
});

export const clockOut = authMutation({
  args: {
    id: v.id("times"),
  },
  handler: async (ctx, args) => {
    const timeRecord = await ctx.db.get(args.id);
    if (!timeRecord) {
      throw new Error("Time record not found");
    }

    if (timeRecord.endTime) {
      throw new Error("Employee has already clocked out for this time record");
    }

    await ctx.db.patch(args.id, {
      endTime: new Date().getTime(),
    });

    return args.id;
  },
});

export const destroy = authMutation({
  args: { id: v.id("times") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
