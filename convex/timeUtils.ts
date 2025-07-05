import { QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { parseDate } from "./utils";

/**
 * Time utilities for handling UTC time operations and time record calculations
 */

/**
 * Get the start of today in UTC time (00:00:00)
 */
export function getStartOfTodayUtc(): Date {
  const utcNow = new Date();
  return new Date(
    Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), utcNow.getUTCDate())
  );
}

/**
 * Get the end of today in UTC time (23:59:59.999)
 */
export function getEndOfTodayUtc(): Date {
  const startOfToday = getStartOfTodayUtc();
  const endOfToday = new Date(startOfToday);
  endOfToday.setUTCHours(23, 59, 59, 999);
  return endOfToday;
}

/**
 * Get the start of the current week (Sunday 00:00:00) in UTC
 */
export function getStartOfCurrentWeekUtc(): Date {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setUTCDate(now.getUTCDate() - now.getUTCDay());
  startOfWeek.setUTCHours(0, 0, 0, 0);
  return startOfWeek;
}

/**
 * Get the end of the current week (Saturday 23:59:59.999) in UTC
 */
export function getEndOfCurrentWeekUtc(): Date {
  const startOfWeek = getStartOfCurrentWeekUtc();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);
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
export function calculateTotalTime(
  startTime: string,
  endTime: string,
  dateTimestamp: number
): number {
  // Parse time strings (e.g., "14:08") and combine with timestamp date
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  // Create Date objects using the timestamp date and parsed times
  const start = new Date(dateTimestamp);
  start.setUTCHours(startHour, startMinute, 0, 0);

  const end = new Date(dateTimestamp);
  end.setUTCHours(endHour, endMinute, 0, 0);

  // Handle case where end time is next day (e.g., shift crosses midnight)
  if (end < start) {
    end.setUTCDate(end.getUTCDate() + 1);
  }

  return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
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
  start: string | number | undefined,
  end: string | number | undefined
) {
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
  const startDate =
    typeof start === "number"
      ? start
      : parseDate(start || "1000-01-01")!.getTime();
  const endDate =
    typeof end === "number" ? end : parseDate(end || "3000-01-01")!.getTime();

  return ctx.db
    .query("times")
    .withIndex("by_employeeId_date", (q) => {
      return q
        .eq("employeeId", employeeId)
        .gte("date", startDate)
        .lte("date", endDate);
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
    .withIndex("by_employeeId_date", (q) =>
      q
        .eq("employeeId", employeeId)
        .gte("date", startTimestamp)
        .lte("date", endTimestamp)
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
    .withIndex("by_employeeId_date", (q) =>
      q.eq("employeeId", employeeId).gte("date", fromTimestamp)
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
  const startOfToday = getStartOfTodayUtc().getTime();
  const endOfToday = getEndOfTodayUtc().getTime();
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
  const currentWeekStart = getStartOfCurrentWeekUtc().getTime();
  const currentWeekEnd = getEndOfCurrentWeekUtc().getTime();
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
