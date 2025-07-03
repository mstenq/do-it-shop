import { JSX } from "react";
import { format } from "date-fns";
import { tryCatch } from "./tryCatch";

export const createMonthGrouper = <Row,>(
  key: keyof Row,
  label?: string
): {
  grouper: (row: Row) => string;
  above: (rows: Row[], depth?: number) => JSX.Element;
} => {
  return {
    grouper: (row: Row) => {
      const date = String(row[key]);
      if (!date) return `No ${label}`;
      const [result, error] = tryCatch(() => format(new Date(date), "yyyy/MM"));
      if (error) {
        return `No ${label}`;
      }
      return result;
    },
    above: (rows: Row[], depth = 0) => {
      const count = rows.length;
      const dateStr = rows?.[0]?.[key]
        ? format(new Date(String(rows[0][key])), "MMMM yyyy")
        : `No ${label}`;
      return (
        <div className="bg-gray-100" style={{ paddingLeft: `${depth * 16}px` }}>
          {dateStr} ({count} {count === 1 ? "item" : "items"})
        </div>
      );
    },
  };
};

export const createYearGrouper = <Row,>(
  key: keyof Row,
  label?: string
): {
  grouper: (row: Row) => string;
  above: (rows: Row[], depth?: number) => JSX.Element;
} => {
  return {
    grouper: (row: Row) => {
      const date = String(row[key]);
      if (!date) return `No ${label}`;
      const [result, error] = tryCatch(() => format(new Date(date), "yyyy"));
      if (error) {
        return `No ${label}`;
      }
      return result;
    },
    above: (rows: Row[], depth = 0) => {
      const count = rows.length;
      const dateStr = rows?.[0]?.[key]
        ? format(new Date(String(rows[0][key])), "yyyy")
        : `${label}`;
      return (
        <div className="bg-gray-100" style={{ paddingLeft: `${depth * 16}px` }}>
          {label}: {dateStr} ({count} {count === 1 ? "item" : "items"})
        </div>
      );
    },
  };
};
