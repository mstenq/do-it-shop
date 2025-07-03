import { v } from "convex/values";
import { internal } from "./_generated/api";
import { authMutation, authQuery, joinData, NullP } from "./utils";
import { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import {
  getCurrentPayPeriodInfo,
  getPayPeriodInfoForDate,
} from "./payScheduleUtils";

/**
 * Queries
 */
export const all = authQuery({
  args: {},
  handler: async (ctx, args) => {
    const records = await ctx.db.query("paySchedule").collect();

    return records;
  },
});

export const get = authQuery({
  args: { _id: v.string() },
  handler: async (ctx, args) => {
    if (!args._id) {
      return null;
    }
    const record = await ctx.db.get(args._id as Id<"paySchedule">);

    if (!record) {
      return null;
    }

    return record;
  },
});

export const generatePaySchedule = internalMutation({
  args: {},
  handler: async (ctx): Promise<any> => {
    // Get current pay period information using utilities
    const payPeriodInfo = getCurrentPayPeriodInfo();
    const { year, payPeriod, name, startDate, endDate } = payPeriodInfo;

    // Check if current pay schedule already exists
    const existingPaySchedule = await ctx.db
      .query("paySchedule")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (existingPaySchedule) {
      return existingPaySchedule;
    }

    // Generate unique ID for the pay schedule
    const id: string = await ctx.runMutation(internal.incrementors.getNextId, {
      tableName: "paySchedule",
    });

    // Convert dates to UTC timestamps for storage
    const startDateUTC = startDate.getTime();
    const endDateUTC = endDate.getTime();

    // Create the pay schedule
    const newPayScheduleId = await ctx.db.insert("paySchedule", {
      id,
      name,
      payPeriod,
      year,
      startDate: startDateUTC,
      endDate: endDateUTC,
    });

    return await ctx.db.get(newPayScheduleId);
  },
});

export const getCurrentPayPeriod = authQuery({
  args: {},
  handler: async (ctx, args) => {
    const payPeriodInfo = getCurrentPayPeriodInfo();

    // Try to find existing pay schedule first
    const existingPaySchedule = await ctx.db
      .query("paySchedule")
      .withIndex("by_name", (q) => q.eq("name", payPeriodInfo.name))
      .first();

    return existingPaySchedule;
  },
});

export const getPayPeriodForDate = authQuery({
  args: { date: v.number() },
  handler: async (ctx, args) => {
    const date = new Date(args.date);
    const payPeriodInfo = getPayPeriodInfoForDate(date);

    // Try to find existing pay schedule
    const existingPaySchedule = await ctx.db
      .query("paySchedule")
      .withIndex("by_name", (q) => q.eq("name", payPeriodInfo.name))
      .first();

    return existingPaySchedule;
  },
});
