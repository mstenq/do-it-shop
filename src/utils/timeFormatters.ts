export const formatTimeString = (value: string | undefined | null): string => {
  if (value === undefined || value === null) return "--:--";
  // Explicitly treat the input as UTC by appending 'Z' to indicate UTC timezone
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const date = new Date(`${today}T${value}Z`);
  if (isNaN(date.getTime())) return "--:--"; // invalid time format

  console.log(date);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
