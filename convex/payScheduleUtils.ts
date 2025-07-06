import { parseDate } from "./utils";

/**
 * Pay Schedule Utilities
 *
 * This module contains reusable utility functions for calculating
 * pay periods, dates, and other pay schedule-related logic.
 *
 * Pay Period Logic:
 * - Each pay period is exactly 14 days (bi-weekly, Sunday to Saturday)
 * - PP01 of each year starts based on the first Sunday of that year:
 *   - If Jan 1 is NOT a Sunday: PP01 starts 14 days before the first Sunday
 *   - If Jan 1 IS a Sunday: PP01 starts on Dec 25 of the previous year
 * - Pay periods can span across calendar years (e.g., 2025-PP01 starts Dec 22, 2024)
 * - The year in the pay period name corresponds to the year where the period ends
 *   or where the majority of the period falls
 */

export interface PayPeriodInfo {
  year: number;
  payPeriod: number;
  name: string;
  startDate: Date;
  endDate: Date;
  currentWeek: number; // Deprecated: kept for compatibility but not used in calculations
  dayOfYear: number;
}

// Constants for better readability
const DAYS_PER_PAY_PERIOD = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;

/**
 * Determines if a date falls within Daylight Saving Time in Mountain Time
 */
export function isDaylightSavingTime(
  year: number,
  month: number,
  day: number
): boolean {
  // DST runs from 2nd Sunday in March to 1st Sunday in November
  if (month < 2 || month > 10) return false; // Jan, Feb, Dec - always MST
  if (month >= 3 && month <= 9) return true; // Apr-Oct - always MDT

  // Calculate DST boundaries for March and November
  const marchSecondSunday = getNthSundayOfMonth(year, 2, 2); // 2nd Sunday of March
  const novemberFirstSunday = getNthSundayOfMonth(year, 10, 1); // 1st Sunday of November

  if (month === 2) return day >= marchSecondSunday; // March
  if (month === 10) return day < novemberFirstSunday; // November

  return false;
}

/**
 * Helper function to get the nth Sunday of a given month
 */
function getNthSundayOfMonth(year: number, month: number, nth: number): number {
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  const firstDayWeekday = firstDayOfMonth.getUTCDay(); // 0 = Sunday
  const daysToFirstSunday =
    firstDayWeekday === 0 ? 0 : DAYS_PER_WEEK - firstDayWeekday;
  return 1 + daysToFirstSunday + (nth - 1) * DAYS_PER_WEEK;
}

/**
 * Find the Sunday that starts the week containing the given date
 * (Sunday that contains or precedes the date)
 */
function getSundayOfWeek(date: Date): Date {
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday
  if (dayOfWeek === 0) {
    // Date is already a Sunday
    return new Date(date);
  } else {
    // Go back to the previous Sunday
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate() - dayOfWeek
      )
    );
  }
}

/**
 * Get Mountain Time offset from UTC (-6 for MDT, -7 for MST)
 */
export function getMountainTimeOffset(
  year: number,
  month: number,
  day: number
): number {
  return isDaylightSavingTime(year, month, day) ? -6 : -7;
}

/**
 * Convert UTC date to Mountain Time (preserving the date/time values)
 */
export function utcDateToMDTDate(date?: Date): Date {
  const utcDate = date || new Date();
  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth();
  const day = utcDate.getUTCDate();
  const hours = utcDate.getUTCHours();
  const minutes = utcDate.getUTCMinutes();
  const seconds = utcDate.getUTCSeconds();
  const milliseconds = utcDate.getUTCMilliseconds();

  const mountainOffset = getMountainTimeOffset(year, month, day);

  // Convert UTC to Mountain Time by adding the offset (negative values become positive)
  return new Date(
    Date.UTC(
      year,
      month,
      day,
      hours - mountainOffset,
      minutes,
      seconds,
      milliseconds
    )
  );
}

/**
 * Calculate the current week number of the year (1-based) based on Mountain Time
 * Uses Sunday-based weeks where Week 1 contains January 1st
 * Note: This is kept for reference but pay periods are no longer calculated from weeks
 */
export function getWeekOfYear(date: Date): number {
  // Convert to Mountain Time
  const mtDate = utcDateToMDTDate(date);
  const year = mtDate.getUTCFullYear();

  // Calculate the start of week 1 (the Sunday that contains or precedes Jan 1)
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const weekOneStart = getSundayOfWeek(jan1);

  // Calculate days since the start of week 1
  const daysSinceWeekOneStart = Math.floor(
    (mtDate.getTime() - weekOneStart.getTime()) / MS_PER_DAY
  );

  // Calculate week number (1-based)
  return Math.floor(daysSinceWeekOneStart / DAYS_PER_WEEK) + 1;
}

/**
 * Calculate the day of year for a given date
 */
function getDayOfYear(date: Date): number {
  const year = date.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  return Math.floor((date.getTime() - startOfYear.getTime()) / MS_PER_DAY) + 1;
}

/**
 * Find the first Sunday of a given year
 */
function getFirstSundayOfYear(year: number): Date {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jan1Day = jan1.getUTCDay(); // 0 = Sunday
  const daysUntilFirstSunday = jan1Day === 0 ? 0 : DAYS_PER_WEEK - jan1Day;
  return new Date(Date.UTC(year, 0, 1 + daysUntilFirstSunday));
}

/**
 * Calculate the start date of PP01 for a given year
 * PP01 always ends on the Saturday before the first Sunday of the year,
 * or if Jan 1 is a Sunday, it ends on the first Saturday (Jan 7)
 */
function calculatePP01StartDate(year: number): Date {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const isJan1Sunday = jan1.getUTCDay() === 0;

  if (isJan1Sunday) {
    // Jan 1 is a Sunday, so PP01 starts on Dec 25 of previous year
    return new Date(Date.UTC(year - 1, 11, 25));
  } else {
    // Find the first Sunday and go back 14 days
    const firstSunday = getFirstSundayOfYear(year);
    return new Date(
      Date.UTC(
        firstSunday.getUTCFullYear(),
        firstSunday.getUTCMonth(),
        firstSunday.getUTCDate() - DAYS_PER_PAY_PERIOD
      )
    );
  }
}

/**
 * Calculate the start date (Sunday) for a given pay period
 */
function calculatePayPeriodStartDate(year: number, payPeriod: number): Date {
  const pp01Start = calculatePP01StartDate(year);
  const daysToAdd = (payPeriod - 1) * DAYS_PER_PAY_PERIOD;
  return new Date(
    Date.UTC(
      pp01Start.getUTCFullYear(),
      pp01Start.getUTCMonth(),
      pp01Start.getUTCDate() + daysToAdd
    )
  );
}

/**
 * Calculate the end date (Saturday) for a given start date
 * End date is 14 days after start date minus 1 second (11:59:59 PM on the 14th day)
 */
function calculatePayPeriodEndDate(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + DAYS_PER_PAY_PERIOD);
  endDate.setUTCSeconds(endDate.getUTCSeconds() - 1);
  return endDate;
}

/**
 * Format the pay schedule name: "YYYY-PP<<payPeriod>>"
 */
function formatPayScheduleName(year: number, payPeriod: number): string {
  return `${year}-PP${payPeriod}`;
}

/**
 * Get comprehensive pay period information for the current date
 */
export function getCurrentPayPeriodInfo(): PayPeriodInfo {
  return getPayPeriodInfoForDate(utcDateToMDTDate());
}

/**
 * Helper to create PayPeriodInfo object
 */
function createPayPeriodInfo(
  year: number,
  payPeriod: number,
  startDate: Date,
  endDate: Date,
  inputDate: Date
): PayPeriodInfo {
  return {
    year,
    payPeriod,
    name: formatPayScheduleName(year, payPeriod),
    startDate: utcDateToMDTDate(startDate),
    endDate: utcDateToMDTDate(endDate),
    currentWeek: getWeekOfYear(inputDate),
    dayOfYear: getDayOfYear(inputDate),
  };
}

/**
 * Check if a date falls within a specific PP01 period and return info if it does
 */
function checkPP01Period(date: Date, year: number): PayPeriodInfo | null {
  const pp01Start = calculatePP01StartDate(year);
  const pp01End = calculatePayPeriodEndDate(pp01Start);

  if (date >= pp01Start && date <= pp01End) {
    return createPayPeriodInfo(year, 1, pp01Start, pp01End, date);
  }
  return null;
}

/**
 * Calculate pay period info using days-since-PP01 method
 */
function calculatePayPeriodFromDays(
  date: Date,
  payYear: number,
  pp01Start: Date
): PayPeriodInfo {
  const daysSincePP01 = Math.floor(
    (date.getTime() - pp01Start.getTime()) / MS_PER_DAY
  );
  const payPeriod = Math.floor(daysSincePP01 / DAYS_PER_PAY_PERIOD) + 1;

  const startDate = calculatePayPeriodStartDate(payYear, payPeriod);
  const endDate = calculatePayPeriodEndDate(startDate);

  return createPayPeriodInfo(payYear, payPeriod, startDate, endDate, date);
}

/**
 * Get pay period information for a specific date
 * This handles the complex logic of year-spanning pay periods
 */
export function getPayPeriodInfoForDate(date: Date): PayPeriodInfo {
  const inputYear = date.getUTCFullYear();

  // Check if the date falls in PP01 of the current year
  const currentYearPP01 = checkPP01Period(date, inputYear);
  if (currentYearPP01) return currentYearPP01;

  // Check if the date falls in PP01 of the next year
  const nextYearPP01 = checkPP01Period(date, inputYear + 1);
  if (nextYearPP01) return nextYearPP01;

  // For all other dates, calculate based on days since PP01 start
  const currentYearPP01Start = calculatePP01StartDate(inputYear);
  const currentYearPP01End = calculatePayPeriodEndDate(currentYearPP01Start);

  if (date >= currentYearPP01End) {
    // Date is after PP01 of current year
    return calculatePayPeriodFromDays(date, inputYear, currentYearPP01Start);
  } else {
    // Date is before current year's PP01, so it belongs to previous year
    const previousYear = inputYear - 1;
    const previousYearPP01Start = calculatePP01StartDate(previousYear);
    return calculatePayPeriodFromDays(
      date,
      previousYear,
      previousYearPP01Start
    );
  }
}

/**
 * @deprecated - dont use - can't delete because convex freaks out
 */
function dateStringToTimestamp(dateString: string | undefined): number {
  if (!dateString) return 0;

  const parsed = parseDate(dateString);
  return parsed ? parsed.getTime() : 0;
}
