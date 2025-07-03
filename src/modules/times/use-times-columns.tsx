import { ConvexType } from "@/utils/convexType";
import { ColumnDef } from "@tanstack/react-table";
import { format, getWeek } from "date-fns";
import { useMemo } from "react";

type Row = ConvexType<"times.all">[number];

export function useTimesColumns() {
  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: "date",
        accessorKey: "date",
        header: "Date",
        enableSorting: false,
        cell: ({ getValue }) =>
          format(new Date(getValue() as string), "yyyy-MM-dd"),
      },
      {
        id: "startTime",
        accessorKey: "startTime",
        header: "Start Time",
        enableSorting: false,
        cell: ({ getValue }) =>
          getValue() ? String(getValue()).slice(0, 5) : "",
      },
      {
        id: "endTime",
        accessorKey: "endTime",
        header: "End Time",
        enableSorting: false,
        cell: ({ getValue }) =>
          getValue() ? String(getValue()).slice(0, 5) : "",
      },
      {
        id: "totalTime",
        accessorKey: "totalTime",
        header: "Total (h)",
        enableSorting: false,
        cell: ({ getValue }) =>
          getValue() ? (Number(getValue()) / 60).toFixed(2) : "",
      },
      {
        id: "year",
        header: "Year",
        enableSorting: false,
        accessorFn: (row) => {
          const date = new Date(row.date);
          return date.getFullYear();
        },
      },
      {
        id: "week",
        header: "Week",
        enableSorting: false,
        accessorFn: (row) => {
          const date = new Date(row.date);
          return getWeek(date);
        },
      },
    ],
    []
  );

  const groupBy = useMemo(
    () => ({
      week: {
        grouper: (row: Row) => {
          const date = new Date(row.date);
          return String(getWeek(date));
        },
        above: (rows: Row[]) => {
          const totalTime = rows.reduce(
            (sum, row) => sum + (row.totalTime || 0),
            0
          );
          const regularHours = totalTime > 40 ? 40 : totalTime;
          const overtime = totalTime > 40 ? totalTime - 40 : 0;
          const week = getWeek(new Date(rows[0].date));
          return (
            <div>
              Week {week} - RT: {regularHours} OT: {overtime} Total: {totalTime}
            </div>
          );
        },
      },
      date: {
        grouper: (row: Row) => {
          const date = new Date(row.date);
          return format(date, "yyyy-MM-dd");
        },
        above: (rows: Row[]) => {
          const totalTime = rows.reduce(
            (sum, row) => sum + (row.totalTime || 0),
            0
          );
          const date = format(new Date(rows[0].date), "MMM dd, yyyy");
          return (
            <div className="pl-2">
              Date {date} - Daily Total: {totalTime}
            </div>
          );
        },
      },
    }),
    []
  );

  return { columns, groupBy };
}
