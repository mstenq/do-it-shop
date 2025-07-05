import { parse } from "date-fns";

export const getStartOfDay = (): number => {
  const localDate = new Date();
  localDate.setHours(0, 0, 0, 0);
  return localDate.getTime();
};

export const getEndOfDay = (): number => {
  const localDate = new Date();
  localDate.setHours(23, 59, 59, 999);
  return localDate.getTime();
};

// Helper function to convert local HH:MM time to UTC HH:MM
export function convertLocalTimeToUtc(
  localTime: string, // Format: "HH:mm"
  localDate: string // Format: "yyyy-MM-dd"
): string {
  // Parse the local date and time
  const localDateTime = parse(
    `${localDate} ${localTime}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );

  // Convert to UTC and format as HH:MM
  const utcHours = localDateTime.getUTCHours();
  const utcMinutes = localDateTime.getUTCMinutes();

  return `${utcHours.toString().padStart(2, "0")}:${utcMinutes.toString().padStart(2, "0")}`;
}

export function convertUtcTimeToLocal(
  utcTime: string, // Format: "HH:mm"
  utcDate: number // Timestamp in milliseconds (UTC date)
): string {
  // Create a date object with the UTC date and time
  const utcDateObj = new Date(utcDate);
  const [hours, minutes] = utcTime.split(":").map(Number);

  utcDateObj.setUTCHours(hours, minutes, 0, 0);

  // Convert to local time and format as HH:MM
  const localHours = utcDateObj.getHours();
  const localMinutes = utcDateObj.getMinutes();

  return `${localHours.toString().padStart(2, "0")}:${localMinutes.toString().padStart(2, "0")}`;
}
