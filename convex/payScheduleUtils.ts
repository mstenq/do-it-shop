import dayjs from "dayjs";
import WeekOfYear from "dayjs/plugin/weekOfYear";
import Timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Duration from "dayjs/plugin/duration";
import { parseDate } from "./utils";
dayjs.extend(utc);
dayjs.extend(Timezone);
dayjs.extend(WeekOfYear);
dayjs.extend(Duration);

const TIME_ZONE = "America/Denver"; // Mountain Time Zone
const DAYS_PER_PAY_PERIOD = 14;

export interface PayPeriodInfo {
  year: number;
  payPeriod: number;
  name: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Find the first Sunday of a given year
 */
function getFirstSundayOfYear(year: number): Date {
  const janFirst = dayjs.tz(`${year}-01-01`, TIME_ZONE);
  const dayOfWeek = janFirst.day(); // 0 = Sunday, 1 = Monday, ...
  // If Jan 1 is Sunday, return it; else, add (7 - dayOfWeek) days
  return dayOfWeek === 0
    ? janFirst.toDate()
    : janFirst.add(7 - dayOfWeek, "day").toDate();
}

/**
 * Calculate the start date of PP01 for a given year
 * PP01 always ends on the Saturday before the first Sunday of the year,
 * or if Jan 1 is a Sunday, it ends on the first Saturday (Jan 7)
 */
function calculatePP01StartDate(year: number): Date {
  const firstSunday = getFirstSundayOfYear(year);
  const start = dayjs
    .tz(firstSunday, TIME_ZONE)
    .subtract(DAYS_PER_PAY_PERIOD, "day");
  return start.toDate();
}

/**
 * Calculate the start date (Sunday) for a given pay period
 */
function calculatePayPeriodStartDate(year: number, payPeriod: number): Date {
  const pp01Start = calculatePP01StartDate(year);
  const daysToAdd = (payPeriod - 1) * DAYS_PER_PAY_PERIOD;
  return dayjs(pp01Start).add(daysToAdd, "day").toDate();
}

/**
 * Calculate the end date (Saturday) for a given start date
 * End date is 14 days after start date minus 1 second (11:59:59 PM on the 14th day)
 */
function calculatePayPeriodEndDate(startDate: Date): Date {
  return dayjs(startDate)
    .add(DAYS_PER_PAY_PERIOD, "day")
    .subtract(1, "millisecond")
    .toDate();
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
  return getPayPeriodInfoForDate(dayjs.tz(new Date(), TIME_ZONE).toDate());
}

/**
 * Check if a date falls within a specific PP01 period and return info if it does
 */
function checkPP01Period(date: Date, year: number): PayPeriodInfo | null {
  const pp01Start = calculatePP01StartDate(year);
  const pp01End = calculatePayPeriodEndDate(pp01Start);
  if (date >= pp01Start && date <= pp01End) {
    return createPayPeriodInfo(year, 1, pp01Start, pp01End);
  }
  return null;
}

/**
 * Helper to create PayPeriodInfo object
 */
function createPayPeriodInfo(
  year: number,
  payPeriod: number,
  startDate: Date,
  endDate: Date
): PayPeriodInfo {
  return {
    year,
    payPeriod,
    name: formatPayScheduleName(year, payPeriod),
    startDate: startDate,
    endDate: endDate,
  };
}

/**
 * Calculate pay period info using days-since-PP01 method
 */
function calculatePayPeriodFromDays(
  date: Date,
  payYear: number,
  pp01Start: Date
): PayPeriodInfo {
  const daysSincePP01 = dayjs(date).diff(dayjs(pp01Start), "day");
  const payPeriod = Math.floor(daysSincePP01 / DAYS_PER_PAY_PERIOD) + 1;

  let startDate = dayjs.tz(
    calculatePayPeriodStartDate(payYear, payPeriod),
    TIME_ZONE
  );
  if (startDate.hour() === 1) {
    startDate = startDate.hour(0);
  }
  let endDate = dayjs.tz(
    calculatePayPeriodEndDate(startDate.toDate()),
    TIME_ZONE
  );
  if (endDate.hour() === 1) {
    endDate = endDate.hour(0);
  }

  return createPayPeriodInfo(
    payYear,
    payPeriod,
    startDate.toDate(),
    endDate.toDate()
  );
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
