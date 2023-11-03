export type MaybeDate = Date | string | number | undefined;

/**
 * @deprecated - use dayjs instead
 */
export const isDate = (date: MaybeDate): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * @deprecated - use dayjs instead
 */
export const newDate = (date: MaybeDate) => {
  let parsedDate: MaybeDate = undefined;
  if (typeof date === "string" && !date.includes("T")) {
    parsedDate = new Date(new Date(date + "T00:00:00.000"));
  } else if (typeof date === "string") {
    parsedDate = new Date(date);
  } else if (typeof date === "number") {
    parsedDate = new Date(date);
  }

  if (isDate(parsedDate)) {
    return parsedDate;
  }
  throw new Error("Invalid date");
};
