/**
 * Time utilities for handling UTC time operations
 */

/**
 * Get the current UTC date and time
 */
function getCurrentUtcTime(): Date {
  const now = new Date();
  return new Date(now.getTime() + now.getTimezoneOffset() * 60000);
}

/**
 * Get the start of today in UTC time (00:00:00)
 */
export function getStartOfTodayUtc(): Date {
  const utcNow = getCurrentUtcTime();
  return new Date(utcNow.getFullYear(), utcNow.getMonth(), utcNow.getDate());
}

/**
 * Format a date as HH:MM string
 */
function formatTimeAsHHMM(date: Date): string {
  return `${date.getHours().toString()}:${date.getMinutes().toString().padStart(2, "0")}`;
}

/**
 * Get current time formatted as HH:MM in UTC
 */
export function getCurrentTimeHHMM(): string {
  const utcNow = getCurrentUtcTime();
  return formatTimeAsHHMM(utcNow);
}
