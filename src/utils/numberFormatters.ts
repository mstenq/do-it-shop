export const formatHours = (
  value: number | string | undefined | null
): string => {
  if (value === undefined || value === null) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    style: "decimal",
  }).format(num);
};
