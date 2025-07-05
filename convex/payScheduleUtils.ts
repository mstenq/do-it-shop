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

function isDaylightSavingTime(
  year: number,
  month: number, // 0-based month (0 = January)
  day: number
): boolean {
  // Find the second Sunday in March
  const marchFirst = new Date(Date.UTC(year, 2, 1)); // March 1st
  const marchFirstDay = marchFirst.getUTCDay(); // 0 = Sunday
  const daysToFirstSunday = marchFirstDay === 0 ? 0 : 7 - marchFirstDay;
  const secondSundayMarch = 1 + daysToFirstSunday + 7; // Second Sunday

  // Find the first Sunday in November
  const novemberFirst = new Date(Date.UTC(year, 10, 1)); // November 1st
  const novemberFirstDay = novemberFirst.getUTCDay(); // 0 = Sunday
  const daysToFirstSundayNov =
    novemberFirstDay === 0 ? 0 : 7 - novemberFirstDay;
  const firstSundayNovember = 1 + daysToFirstSundayNov; // First Sunday

  // Check if the date falls within DST period
  if (month < 2) return false; // January, February - always MST
  if (month > 10) return false; // December - always MST
  if (month >= 3 && month <= 9) return true; // April through October - always MDT

  if (month === 2) {
    // March
    return day >= secondSundayMarch;
  }

  if (month === 10) {
    // November
    return day < firstSundayNovember;
  }

  return false;
}

function getMountainTimeOffset(
  year: number,
  month: number,
  day: number
): number {
  return isDaylightSavingTime(year, month, day) ? -6 : -7;
}

function utcDateToMDTDate(date?: Date): Date {
  const utcDate = date || new Date();
  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth();
  const day = utcDate.getUTCDate();
  const hours = utcDate.getUTCHours();
  const minutes = utcDate.getUTCMinutes();
  const seconds = utcDate.getUTCSeconds();
  const milliseconds = utcDate.getUTCMilliseconds();
  const mountainOffset = getMountainTimeOffset(year, month, day);
  // Create date preserving the original time, adjusted for MDT offset
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
 * Calculate the current week number of the year (1-based)
 * Note: This is kept for reference but pay periods are no longer calculated from weeks
 */
function getWeekOfYear(date: Date): number {
  const year = date.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const msPerDay = 24 * 60 * 60 * 1000;
  const dayOfYear =
    Math.floor((date.getTime() - startOfYear.getTime()) / msPerDay) + 1;
  return Math.ceil(dayOfYear / 7);
}

/**
 * Find the first Sunday of a given year
 */
function getFirstSundayOfYear(year: number): Date {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jan1Day = jan1.getUTCDay(); // 0 = Sunday
  const daysUntilFirstSunday = jan1Day === 0 ? 0 : 7 - jan1Day;
  return new Date(Date.UTC(year, 0, 1 + daysUntilFirstSunday));
}

/**
 * Calculate the start date of PP01 for a given year
 * PP01 always ends on the Saturday before the first Sunday of the year,
 * or if Jan 1 is a Sunday, it ends on the first Saturday (Jan 7)
 */
function calculatePP01StartDate(year: number): Date {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jan1Day = jan1.getUTCDay(); // 0 = Sunday

  if (jan1Day === 0) {
    // Jan 1 is a Sunday, so PP01 ends on Jan 7 (Saturday)
    // PP01 starts 13 days earlier (Dec 25)
    return new Date(Date.UTC(year - 1, 11, 25));
  } else {
    // Jan 1 is not a Sunday, so find the first Sunday and go back 14 days
    const firstSunday = getFirstSundayOfYear(year);
    const pp01Start = new Date(firstSunday);
    pp01Start.setUTCDate(firstSunday.getUTCDate() - 14);
    return pp01Start;
  }
}

/**
 * Calculate the start date (Sunday) for a given pay period
 */
function calculatePayPeriodStartDate(year: number, payPeriod: number): Date {
  const pp01Start = calculatePP01StartDate(year);
  const weeksToAdd = (payPeriod - 1) * 2;
  const startDate = new Date(pp01Start);
  startDate.setUTCDate(pp01Start.getUTCDate() + weeksToAdd * 7);
  return startDate;
}

/**
 * Calculate the end date (Saturday) for a given start date
 * End date is 14 days after start date minus 1 second (11:59:59 PM on the 14th day)
 */
function calculatePayPeriodEndDate(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 14);
  endDate.setUTCSeconds(endDate.getUTCSeconds() - 1);
  return endDate;
}

/**
 * Format the pay schedule name: "YYYY-PP<<payPeriod>>"
 */
function formatPayScheduleName(year: number, payPeriod: number): string {
  return `${year}-PP${payPeriod.toString()}`;
}

/**
 * Get comprehensive pay period information for the current date
 */
export function getCurrentPayPeriodInfo(): PayPeriodInfo {
  return getPayPeriodInfoForDate(new Date());
}

/**
 * Get pay period information for a specific date
 * This handles the complex logic of year-spanning pay periods
 */
export function getPayPeriodInfoForDate(date: Date): PayPeriodInfo {
  const inputYear = date.getUTCFullYear();

  // Check if the date falls in PP01 of the current year
  const currentYearPP01Start = calculatePP01StartDate(inputYear);
  const currentYearPP01End = calculatePayPeriodEndDate(currentYearPP01Start);

  if (date >= currentYearPP01Start && date <= currentYearPP01End) {
    // Date is in PP01 of the current year
    return {
      year: inputYear,
      payPeriod: 1,
      name: formatPayScheduleName(inputYear, 1),
      startDate: utcDateToMDTDate(currentYearPP01Start),
      endDate: utcDateToMDTDate(currentYearPP01End),
      currentWeek: getWeekOfYear(date),
      dayOfYear: getDayOfYear(date),
    };
  }

  // Check if the date falls in PP01 of the next year
  const nextYearPP01Start = calculatePP01StartDate(inputYear + 1);
  const nextYearPP01End = calculatePayPeriodEndDate(nextYearPP01Start);

  if (date >= nextYearPP01Start && date <= nextYearPP01End) {
    // Date is in PP01 of the next year (starts in December of current year)
    return {
      year: inputYear + 1,
      payPeriod: 1,
      name: formatPayScheduleName(inputYear + 1, 1),
      startDate: utcDateToMDTDate(nextYearPP01Start),
      endDate: utcDateToMDTDate(nextYearPP01End),
      currentWeek: getWeekOfYear(date),
      dayOfYear: getDayOfYear(date),
    };
  }

  // For all other dates, calculate based on days since PP01 start
  let payYear: number;
  let pp01Start: Date;

  if (date >= currentYearPP01End) {
    // Date is after PP01 of current year
    payYear = inputYear;
    pp01Start = currentYearPP01Start;
  } else {
    // Date might be in a previous year's pay periods
    payYear = inputYear - 1;
    pp01Start = calculatePP01StartDate(payYear);
  }

  // Calculate days since PP01 start
  const daysSincePP01 = Math.floor(
    (date.getTime() - pp01Start.getTime()) / (24 * 60 * 60 * 1000)
  );

  // Calculate pay period number (14 days per period)
  const payPeriod = Math.floor(daysSincePP01 / 14) + 1;

  // Calculate the actual start and end dates for this pay period
  const startDate = calculatePayPeriodStartDate(payYear, payPeriod);
  const endDate = calculatePayPeriodEndDate(startDate);

  return {
    year: payYear,
    payPeriod,
    name: formatPayScheduleName(payYear, payPeriod),
    startDate: utcDateToMDTDate(startDate),
    endDate: utcDateToMDTDate(endDate),
    currentWeek: getWeekOfYear(date),
    dayOfYear: getDayOfYear(date),
  };
}

/**
 * Calculate the day of year for a given date
 */
function getDayOfYear(date: Date): number {
  const year = date.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((date.getTime() - startOfYear.getTime()) / msPerDay) + 1;
}

/**
 *
 * @deprecated - dont use - can't delete because convex freaks out
 */
export function dateStringToTimestamp(dateString: string | undefined): number {
  if (!dateString) return 0;

  const parsed = parseDate(dateString);
  return parsed ? parsed.getTime() : 0;
}
