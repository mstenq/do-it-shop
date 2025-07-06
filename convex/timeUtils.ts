import { QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { parseDate } from "./utils";
import { utcDateToMDTDate, getMountainTimeOffset } from "./payScheduleUtils";

/**
 * Time utilities for handling Mountain Time operations and time record calculations
 */

// Constants for time calculations
const MILLISECONDS_IN_ALMOST_FULL_DAY =
  23 * 60 * 60 * 1000 + // 23 hours
  59 * 60 * 1000 + // 59 minutes
  59 * 1000 + // 59 seconds
  999; // 999 milliseconds

/**
 * Get the start of today in Mountain Time (00:00:00)
 */
export function getStartOfTodayMDT(): Date {
  const mdtNow = utcDateToMDTDate();
  const year = mdtNow.getUTCFullYear();
  const month = mdtNow.getUTCMonth();
  const day = mdtNow.getUTCDate();

  // Get the Mountain Time offset for today
  const mountainOffset = getMountainTimeOffset(year, month, day);

  // Create 00:00:00 Mountain Time and convert to UTC
  // Since mountainOffset is negative, we subtract it to convert Mountain Time to UTC
  return new Date(Date.UTC(year, month, day, 0 - mountainOffset, 0, 0, 0));
}

/**
 * Get the end of today in Mountain Time (23:59:59.999)
 */
export function getEndOfTodayMDT(): Date {
  const startOfToday = getStartOfTodayMDT();
  const endOfToday = new Date(startOfToday);
  endOfToday.setTime(endOfToday.getTime() + MILLISECONDS_IN_ALMOST_FULL_DAY);
  return endOfToday;
}

/**
 * Get the start of the current week (Sunday 00:00:00) in Mountain Time
 */
export function getStartOfCurrentWeekMDT(): Date {
  const mdtNow = utcDateToMDTDate();
  const year = mdtNow.getUTCFullYear();
  const month = mdtNow.getUTCMonth();
  const weekStartDay = mdtNow.getUTCDate() - mdtNow.getUTCDay(); // Sunday of this week

  // Get the Mountain Time offset for the start of the week
  const weekStartDate = new Date(Date.UTC(year, month, weekStartDay));
  const mountainOffset = getMountainTimeOffset(
    weekStartDate.getUTCFullYear(),
    weekStartDate.getUTCMonth(),
    weekStartDate.getUTCDate()
  );

  // Create Sunday 00:00:00 Mountain Time and convert to UTC
  return new Date(
    Date.UTC(year, month, weekStartDay, 0 - mountainOffset, 0, 0, 0)
  );
}

/**
 * Get the end of the current week (Saturday 23:59:59.999) in Mountain Time
 */
export function getEndOfCurrentWeekMTD(): Date {
  const startOfWeek = getStartOfCurrentWeekMDT();
  const endOfWeek = new Date(startOfWeek);
  // Add 6 days worth of milliseconds plus almost a full day to get to Saturday 23:59:59.999
  endOfWeek.setTime(
    endOfWeek.getTime() +
      6 * 24 * 60 * 60 * 1000 +
      MILLISECONDS_IN_ALMOST_FULL_DAY
  );
  return endOfWeek;
}

/**
 * Format a date as HH:MM string using UTC time
 */
function formatTimeAsHHMM(date: Date): string {
  return `${date.getUTCHours().toString()}:${date.getUTCMinutes().toString().padStart(2, "0")}`;
}

/**
 * Get current time formatted as HH:MM in UTC
 */
export function getCurrentTimeHHMM(): string {
  return formatTimeAsHHMM(new Date());
}

/**
 * Calculate total time in hours from start and end time strings (HH:MM format)
 * and a date timestamp. Handles overnight shifts that cross midnight.
 */
export function calculateTotalTime(startTime: number, endTime: number): number {
  return (endTime - startTime) / (1000 * 60 * 60); // hours
}

/**
 * Sum total hours from an array of time records
 */
export function sumTotalHours(
  timeRecords: Array<{ totalTime?: number }>
): number {
  return timeRecords.reduce((sum, record) => sum + (record.totalTime ?? 0), 0);
}

/**
 * Query time records for a date range
 */
export function timesDateRangeQuery(
  ctx: QueryCtx,
  start: number | undefined,
  end: number | undefined
) {
  const startRange = start ?? parseDate("1000-01-01")!.getTime();
  const endRange = end ?? parseDate("3000-01-01")!.getTime();

  return ctx.db
    .query("times")
    .withIndex("by_startTime", (q) => {
      return q.gte("startTime", startRange).lte("startTime", endRange);
    })
    .order("desc");
}

/**
 * Query time records for a specific employee and date range
 */
export function timesEmployeeAndDateRangeQuery(
  ctx: QueryCtx,
  employeeId: Id<"employees">,
  start: number | undefined,
  end: number | undefined
) {
  const startRange = start ?? parseDate("1000-01-01")!.getTime();
  const endRange = end ?? parseDate("3000-01-01")!.getTime();

  return ctx.db
    .query("times")
    .withIndex("by_employeeId_startTime", (q) => {
      return q
        .eq("employeeId", employeeId)
        .gte("startTime", startRange)
        .lte("startTime", endRange);
    })
    .order("desc");
}

/**
 * Get completed time records (with endTime) for an employee in a date range
 */
export async function getCompletedTimeRecords(
  ctx: QueryCtx,
  employeeId: Id<"employees">,
  startTimestamp: number,
  endTimestamp: number
) {
  return await ctx.db
    .query("times")
    .withIndex("by_employeeId_startTime", (q) =>
      q
        .eq("employeeId", employeeId)
        .gte("startTime", startTimestamp)
        .lte("startTime", endTimestamp)
    )
    .filter((q) => q.neq(q.field("endTime"), undefined))
    .collect();
}

/**
 * Get open time record (without endTime) for an employee from a specific date onwards
 */
export async function getMostRecentOpenTimeRecord(
  ctx: QueryCtx,
  employeeId: Id<"employees">,
  fromTimestamp: number
) {
  return await ctx.db
    .query("times")
    .withIndex("by_employeeId_startTime", (q) =>
      q.eq("employeeId", employeeId).gte("startTime", fromTimestamp)
    )
    .filter((q) => q.eq(q.field("endTime"), undefined))
    .first();
}

/**
 * Calculate hours for an employee for different time periods
 */
export async function calculateEmployeeHours(
  ctx: QueryCtx,
  employeeId: Id<"employees">,
  payPeriodStart: number,
  payPeriodEnd: number
) {
  // Today's hours
  console.log("startOfToday:", getStartOfTodayMDT());
  console.log("endOfToday:", getEndOfTodayMDT());
  const startOfToday = getStartOfTodayMDT().getTime();
  const endOfToday = getEndOfTodayMDT().getTime();

  const todayTimes = await getCompletedTimeRecords(
    ctx,
    employeeId,
    startOfToday,
    endOfToday
  );
  const currentDailyHours = sumTotalHours(todayTimes);

  // Pay period hours
  const payPeriodTimes = await getCompletedTimeRecords(
    ctx,
    employeeId,
    payPeriodStart,
    payPeriodEnd
  );
  const currentPayPeriodHours = sumTotalHours(payPeriodTimes);

  // Current week hours
  const currentWeekStart = getStartOfCurrentWeekMDT().getTime();
  const currentWeekEnd = getEndOfCurrentWeekMTD().getTime();
  const currentWeekTimes = await getCompletedTimeRecords(
    ctx,
    employeeId,
    currentWeekStart,
    currentWeekEnd
  );
  const currentWeekHours = sumTotalHours(currentWeekTimes);

  return {
    currentDailyHours,
    currentPayPeriodHours,
    currentWeekHours,
  };
}
