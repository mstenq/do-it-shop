import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import {
  getCurrentPayPeriodInfo,
  getPayPeriodInfoForDate,
} from "./payScheduleUtils";
import { timesDateRangeQuery } from "./timeUtils";
import { internalMutation } from "./triggers";
import { authQuery, parseDate } from "./utils";
import dayjs from "dayjs";
import WeekOfYear from "dayjs/plugin/weekOfYear";
import Timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import CustomParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(utc);
dayjs.extend(Timezone);
dayjs.extend(WeekOfYear);
dayjs.extend(CustomParseFormat);

/**
 * Group time entries by week and calculate hours for each week
 */
function groupTimeEntries<T extends { startTime: number; totalTime?: number }>(
  timeEntries: Array<T>,
  groupBy: (item: T) => number
) {
  // Group entries by week
  const groups = new Map<number, Array<T>>();

  timeEntries.forEach((entry) => {
    const groupKey = groupBy(entry);

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(entry);
  });

  // Calculate hours for each week
  const groupData = Array.from(groups.entries())
    .map(([group, entries]) => {
      const groupTotalHours = entries.reduce(
        (sum, entry) => sum + (entry.totalTime ?? 0),
        0
      );
      const groupRegularHours = Math.min(groupTotalHours, 40);
      const groupOvertimeHours = Math.max(groupTotalHours - 40, 0);

      return {
        group,
        groupTotalHours,
        groupOvertimeHours,
        groupRegularHours,
        timeEntries: entries.sort((a, b) => a.startTime - b.startTime), // Sort by start time
      };
    })
    .sort((a, b) => a.group - b.group);

  return groupData;
}

/**
 * Queries
 */
export const all = authQuery({
  args: { start: v.optional(v.number()), end: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("paySchedule")
      .withIndex("by_startDate", (q) => {
        if (args.start && args.end) {
          return q.gte("startDate", args.start).lte("startDate", args.end);
        } else if (args.start) {
          return q.gte("startDate", args.start);
        } else if (args.end) {
          return q.lte("startDate", args.end);
        } else {
          return q;
        }
      })
      .order("desc")
      .collect();

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
      const weeklyTimeEntries = groupTimeEntries(employeeTimes, (entry) => {
        return dayjs.tz(entry.startTime, "America/Denver").week();
      });

      const formattedWeeklyEntries = weeklyTimeEntries.map((week) => {
        const dailyTimeEntries = groupTimeEntries(week.timeEntries, (entry) => {
          return dayjs
            .tz(entry.startTime, "America/Denver")
            .startOf("day")
            .valueOf();
        });
        const formattedDailyEntries = dailyTimeEntries.map((day) => ({
          date: dayjs.tz(day.group, "America/Denver").format("M/D/YYYY"),
          dayTotalHours: day.groupTotalHours,
          dayTimeEntries: day.timeEntries,
        }));
        return {
          week: week.group,
          weekTotalHours: week.groupTotalHours,
          weekRegularHours: week.groupRegularHours,
          weekOvertimeHours: week.groupOvertimeHours,
          days: formattedDailyEntries,
        };
      });

      // Calculate period totals
      const periodTotalHours = employeeTimes.reduce(
        (sum, entry) => sum + (entry.totalTime ?? 0),
        0
      );
      const periodRegularHours = weeklyTimeEntries.reduce(
        (sum, week) => sum + week.groupRegularHours,
        0
      );
      const periodOvertimeHours = weeklyTimeEntries.reduce(
        (sum, week) => sum + week.groupOvertimeHours,
        0
      );

      return {
        ...employee,
        periodTotalHours,
        periodRegularHours,
        periodOvertimeHours,
        weekGroups: formattedWeeklyEntries,
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
