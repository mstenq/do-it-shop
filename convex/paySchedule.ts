import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import {
  getCurrentPayPeriodInfo,
  getPayPeriodInfoForDate,
  getWeekOfYear,
} from "./payScheduleUtils";
import { timesDateRangeQuery } from "./timeUtils";
import { internalMutation } from "./triggers";
import { authQuery, parseDate } from "./utils";

/**
 * Group time entries by week and calculate hours for each week
 */
function groupTimeEntriesByWeek<
  T extends { startTime: number; totalTime?: number },
>(timeEntries: Array<T>) {
  // Group entries by week
  const weekGroups = new Map<number, Array<T>>();

  timeEntries.forEach((entry) => {
    const week = getWeekOfYear(new Date(entry.startTime));
    if (!weekGroups.has(week)) {
      weekGroups.set(week, []);
    }
    weekGroups.get(week)!.push(entry);
  });

  // Calculate hours for each week
  const weeklyData = Array.from(weekGroups.entries())
    .map(([week, entries]) => {
      const weekTotalHours = entries.reduce(
        (sum, entry) => sum + (entry.totalTime ?? 0),
        0
      );
      const weekRegularHours = Math.min(weekTotalHours, 40);
      const weekOvertimeHours = Math.max(weekTotalHours - 40, 0);

      return {
        week,
        weekTotalHours,
        weekOvertimeHours,
        weekRegularHours,
        timeEntries: entries.sort((a, b) => a.startTime - b.startTime), // Sort by start time
      };
    })
    .sort((a, b) => a.week - b.week);

  return weeklyData;
}

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
  args: { id: v.string() },
  handler: async (ctx, args) => {
    console.log(args.id);
    if (!args.id) {
      return null;
    }
    const record = await ctx.db.get(args.id as Id<"paySchedule">);

    if (!record) {
      return null;
    }

    const timeEntries = await timesDateRangeQuery(
      ctx,
      record.startDate,
      record.endDate
    ).collect();

    // get unique employees
    const uniqueEmployeeIds = [
      ...new Set(timeEntries.map((entry) => entry.employeeId)),
    ];
    const employeePromises = uniqueEmployeeIds.map((id) => ctx.db.get(id));
    const employees = (await Promise.all(employeePromises))
      .filter((e) => e !== null)
      .sort((a, b) => {
        // sort by first name, last name
        const nameA = `${a.nameFirst} ${a.nameLast}`.toLowerCase();
        const nameB = `${b.nameFirst} ${b.nameLast}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

    // join time entries with employees
    const employeesWithTimeEntries = employees.map((employee) => {
      const employeeTimes = timeEntries.filter(
        (entry) => entry.employeeId === employee._id
      );

      // Group time entries by week and calculate weekly hours
      const weeklyTimeEntries = groupTimeEntriesByWeek(employeeTimes);

      // Calculate period totals
      const periodTotalHours = employeeTimes.reduce(
        (sum, entry) => sum + (entry.totalTime ?? 0),
        0
      );
      const periodRegularHours = weeklyTimeEntries.reduce(
        (sum, week) => sum + week.weekRegularHours,
        0
      );
      const periodOvertimeHours = weeklyTimeEntries.reduce(
        (sum, week) => sum + week.weekOvertimeHours,
        0
      );

      return {
        ...employee,
        periodTotalHours,
        periodRegularHours,
        periodOvertimeHours,
        timeEntries: weeklyTimeEntries,
        allTimeEntries: employeeTimes, // Keep original time entries for reference
      };
    });

    return {
      ...record,
      timeEntries: timeEntries,
      employees: employeesWithTimeEntries,
    };
  },
});

export const generatePaySchedule = internalMutation({
  args: {},
  handler: async (ctx): Promise<any> => {
    // Get current pay period information using utilities
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1); // Get tomorrow
    const payPeriodInfo = getPayPeriodInfoForDate(tomorrow);
    const { year, payPeriod, name, startDate, endDate } = payPeriodInfo;

    console.log("found", payPeriodInfo);

    // Check if current pay schedule already exists
    const existingPaySchedule = await ctx.db
      .query("paySchedule")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (existingPaySchedule) {
      return existingPaySchedule;
    }

    // Convert dates to UTC timestamps for storage
    const startDateUTC = startDate.getTime();
    const endDateUTC = endDate.getTime();

    // Create the pay schedule
    const newPayScheduleId = await ctx.db.insert("paySchedule", {
      name,
      payPeriod,
      year,
      startDate: startDateUTC,
      endDate: endDateUTC,
      searchIndex: `${name}`,
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

    if (!existingPaySchedule) {
      return null;
    }

    return existingPaySchedule;
  },
});

export const getPayPeriodForDate = authQuery({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const parsedDate = parseDate(args.date);
    if (!parsedDate) {
      console.error("Invalid date format:", args.date);
      throw new Error("Invalid date format. Use YYYY-MM-DD.");
    }
    const payPeriodInfo = getPayPeriodInfoForDate(parsedDate);

    return {
      ...payPeriodInfo,
      startDate: payPeriodInfo.startDate.getTime(),
      endDate: payPeriodInfo.endDate.getTime(),
    };
  },
});

export const backfillPaySchedules = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Start from 7/2/2017
    const startDate = new Date(Date.UTC(2017, 6, 2)); // July is month 6 (0-based)
    const today = new Date(); // This is fine as we're comparing timestamps
    let current = new Date(startDate);
    let created = 0;
    while (current <= today) {
      // Get pay period info for this date
      const payPeriodInfo = getPayPeriodInfoForDate(current);
      const { year, payPeriod, name, startDate, endDate } = payPeriodInfo;
      // Check if this pay schedule already exists
      const existing = await ctx.db
        .query("paySchedule")
        .withIndex("by_name", (q) => q.eq("name", name))
        .first();
      if (!existing) {
        // Insert new pay schedule
        await ctx.db.insert("paySchedule", {
          name,
          payPeriod,
          year,
          startDate: startDate.getTime(),
          endDate: endDate.getTime(),
          searchIndex: `${name}`,
        });
        created++;
      }
      // Move to next pay period (assume biweekly: add 14 days)
      current = new Date(endDate.getTime() + 24 * 60 * 60 * 1000); // Next day after endDate
    }
    return { created };
  },
});
