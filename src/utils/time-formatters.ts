export const formatTimeString = (value: string | undefined | null): string => {
  if (value === undefined || value === null) return "--:--";

  const [hours, minutes] = value.split(":");

  // Explicitly treat the input as UTC by appending 'Z' to indicate UTC timezone
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const date = new Date(`${today}T${hours.padStart(2, "0")}:${minutes}Z`);
  if (isNaN(date.getTime())) return "--:--"; // invalid time format

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
