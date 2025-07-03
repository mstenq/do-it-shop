/**
 * Pay Schedule Utilities
 *
 * This module contains reusable utility functions for calculating
 * pay periods, dates, and other pay schedule-related logic.
 */

export interface PayPeriodInfo {
  year: number;
  payPeriod: number;
  name: string;
  startDate: Date;
  endDate: Date;
  currentWeek: number;
  dayOfYear: number;
}

/**
 * Convert current time to MST timezone
 * MST is UTC-7, but we use UTC-6 for Mountain Daylight Time
 */
export function getCurrentMSTTime(): Date {
  const now = new Date();
  const mstOffset = -6; // Mountain Daylight Time is UTC-6
  return new Date(now.getTime() + mstOffset * 60 * 60 * 1000);
}

/**
 * Calculate the current week number of the year (1-based)
 */
export function getWeekOfYear(date: Date): number {
  const year = date.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const msPerDay = 24 * 60 * 60 * 1000;
  const dayOfYear =
    Math.floor((date.getTime() - startOfYear.getTime()) / msPerDay) + 1;
  return Math.ceil(dayOfYear / 7);
}

/**
 * Calculate the pay period number using: Ceiling(WeekOfYear / 2)
 */
export function calculatePayPeriod(weekOfYear: number): number {
  return Math.ceil(weekOfYear / 2);
}

/**
 * Find the first Sunday of a given year
 */
export function getFirstSundayOfYear(year: number): Date {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jan1Day = jan1.getUTCDay(); // 0 = Sunday
  const daysUntilFirstSunday = jan1Day === 0 ? 0 : 7 - jan1Day;
  return new Date(Date.UTC(year, 0, 1 + daysUntilFirstSunday));
}

/**
 * Calculate the start date (Sunday) for a given pay period
 */
export function calculatePayPeriodStartDate(
  year: number,
  payPeriod: number
): Date {
  const firstSunday = getFirstSundayOfYear(year);
  const weeksToAdd = (payPeriod - 1) * 2;
  const startDate = new Date(firstSunday);
  startDate.setUTCDate(firstSunday.getUTCDate() + weeksToAdd * 7);
  return startDate;
}

/**
 * Calculate the end date (Saturday) for a given start date
 * End date is 13 days after start date (2 weeks - 1 day)
 */
export function calculatePayPeriodEndDate(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 13);
  return endDate;
}

/**
 * Format the pay schedule name: "YYYY-PP<<payPeriod>>"
 */
export function formatPayScheduleName(year: number, payPeriod: number): string {
  return `${year}-PP${payPeriod.toString().padStart(2, "0")}`;
}

/**
 * Get comprehensive pay period information for the current date
 */
export function getCurrentPayPeriodInfo(): PayPeriodInfo {
  const mstNow = getCurrentMSTTime();
  const year = mstNow.getUTCFullYear();
  const currentWeek = getWeekOfYear(mstNow);
  const payPeriod = calculatePayPeriod(currentWeek);
  const name = formatPayScheduleName(year, payPeriod);
  const startDate = calculatePayPeriodStartDate(year, payPeriod);
  const endDate = calculatePayPeriodEndDate(startDate);

  // Calculate day of year for reference
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const msPerDay = 24 * 60 * 60 * 1000;
  const dayOfYear =
    Math.floor((mstNow.getTime() - startOfYear.getTime()) / msPerDay) + 1;

  return {
    year,
    payPeriod,
    name,
    startDate,
    endDate,
    currentWeek,
    dayOfYear,
  };
}

/**
 * Get pay period information for a specific year and pay period number
 */
export function getPayPeriodInfo(
  year: number,
  payPeriod: number
): Omit<PayPeriodInfo, "currentWeek" | "dayOfYear"> {
  const name = formatPayScheduleName(year, payPeriod);
  const startDate = calculatePayPeriodStartDate(year, payPeriod);
  const endDate = calculatePayPeriodEndDate(startDate);

  return {
    year,
    payPeriod,
    name,
    startDate,
    endDate,
  };
}

/**
 * Get pay period information for a specific date
 */
export function getPayPeriodInfoForDate(date: Date): PayPeriodInfo {
  const year = date.getUTCFullYear();
  const currentWeek = getWeekOfYear(date);
  const payPeriod = calculatePayPeriod(currentWeek);
  const name = formatPayScheduleName(year, payPeriod);
  const startDate = calculatePayPeriodStartDate(year, payPeriod);
  const endDate = calculatePayPeriodEndDate(startDate);

  // Calculate day of year for reference
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const msPerDay = 24 * 60 * 60 * 1000;
  const dayOfYear =
    Math.floor((date.getTime() - startOfYear.getTime()) / msPerDay) + 1;

  return {
    year,
    payPeriod,
    name,
    startDate,
    endDate,
    currentWeek,
    dayOfYear,
  };
}

/**
 * Check if a given date falls within a specific pay period
 */
export function isDateInPayPeriod(
  date: Date,
  payPeriodInfo: PayPeriodInfo
): boolean {
  const dateTime = date.getTime();
  const startTime = payPeriodInfo.startDate.getTime();
  const endTime = payPeriodInfo.endDate.getTime();
  return dateTime >= startTime && dateTime <= endTime;
}

/**
 * Get all pay periods for a given year
 */
export function getAllPayPeriodsForYear(
  year: number
): Omit<PayPeriodInfo, "currentWeek" | "dayOfYear">[] {
  const payPeriods: Omit<PayPeriodInfo, "currentWeek" | "dayOfYear">[] = [];

  // Calculate the total number of pay periods in the year
  // Assuming 26 pay periods per year (bi-weekly)
  for (let payPeriod = 1; payPeriod <= 26; payPeriod++) {
    const periodInfo = getPayPeriodInfo(year, payPeriod);

    // Only include pay periods that fall within the year
    if (periodInfo.startDate.getUTCFullYear() === year) {
      payPeriods.push(periodInfo);
    }
  }

  return payPeriods;
}
