import { format, parse } from "date-fns";

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
export function parseDateAndTime(
  dateString: string, // Format: "yyyy-MM-dd"
  timeString: string // Format: "HH:mm"
): Date {
  const date = parse(
    `${dateString} ${timeString}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );
  return date;
}

export function timestampToTimeString(
  dateNumber: number // Timestamp in milliseconds (UTC date)
): string {
  const date = new Date(dateNumber);
  return format(date, "HH:mm");
}
