import { v } from "convex/values";
import { internal } from "./_generated/api";
import { authMutation, authQuery, joinData, NullP, parseDate } from "./utils";
import { Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getStartOfTodayUtc, getCurrentTimeHHMM } from "./timeUtils";

/**
 * Queries
 */

export const timesDateRangeQuery = (
  ctx: QueryCtx,
  start: string | number | undefined,
  end: string | number | undefined
) => {
  const startDate =
    typeof start === "number"
      ? start
      : parseDate(start || "1000-01-01")!.getTime();
  const endDate =
    typeof end === "number" ? end : parseDate(end || "3000-01-01")!.getTime();

  return ctx.db
    .query("times")
    .withIndex("by_date", (q) => {
      return q.gte("date", startDate).lte("date", endDate);
    })
    .order("desc");
};

export const timesEmployeeAndDateRangeQuery = (
  ctx: QueryCtx,
  employeeId: Id<"employees">,
  start: string | undefined,
  end: string | undefined
) => {
  const startDate = parseDate(start || "1000-01-01")!.getTime();
  const endDate = parseDate(end || "3000-01-01")!.getTime();

  return ctx.db
    .query("times")
    .withIndex("by_employeeId_date", (q) => {
      return q
        .eq("employeeId", employeeId)
        .gte("date", startDate)
        .lte("date", endDate);
    })
    .order("desc");
};

export const all = authQuery({
  args: {
    employeeId: v.optional(v.id("employees")),
    dateRange: v.optional(
      v.object({
        start: v.string(),
        end: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
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
  employeeId: v.id("employees"),
  date: v.string(),
  startTime: v.string(),
  endTime: v.optional(v.string()),
};

/**
 * Mutations
 */
export const add = authMutation({
  args: {
    ...commonArgs,
    employeeId: v.id("employees"),
    date: v.string(),
    startTime: v.string(),
    // endTime is optional
  },
  handler: async (ctx, args) => {
    const date = parseDate(args.date);
    if (!date) {
      throw new Error("Invalid date format");
    }

    const newTime = await ctx.db.insert("times", {
      ...args,
      date: date.getTime(),
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
  handler: async (ctx, { _id, date, ...args }) => {
    let time: undefined | number = undefined;
    if (date) {
      const parsedDate = parseDate(date);
      if (!parsedDate) {
        throw new Error("Invalid date format");
      }
      time = parsedDate.getTime();
    }

    await ctx.db.patch(_id, {
      ...args,
      ...(date !== undefined ? { date: time } : {}),
    });
    return;
  },
});

export const clockIn = authMutation({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const startOfToday = getStartOfTodayUtc();
    const startTime = getCurrentTimeHHMM();

    const newTime = await ctx.db.insert("times", {
      employeeId: args.employeeId,
      date: startOfToday.getTime(),
      startTime,
      // endTime is undefined for clock in
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

    const endTime = getCurrentTimeHHMM();

    await ctx.db.patch(args.id, {
      endTime,
    });

    return args.id;
  },
});

export const destroy = authMutation({
  args: { _id: v.id("times") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args._id);
    return args._id;
  },
});
