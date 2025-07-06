export const formatTime = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return "--:--";
  const date = new Date(value);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
