import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ConvexType } from "@/utils/convex-type";
import { formatHours } from "@/utils/number-formatters";
import { formatTime } from "@/utils/time-formatters";
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
        cell: ({ row }) =>
          format(new Date(row.original.startTime), "yyyy-MM-dd"),
      },
      {
        id: "startTime",
        accessorKey: "startTime",
        header: "Start Time",
        enableSorting: false,
        meta: {
          align: "right",
        },
        cell: ({ row }) => formatTime(row.original.startTime),
      },
      {
        id: "endTime",
        accessorKey: "endTime",
        header: "End Time",
        enableSorting: false,
        meta: {
          align: "right",
        },
        cell: ({ row }) => formatTime(row.original.endTime),
      },
      {
        id: "totalTime",
        accessorKey: "totalTime",
        header: "Total (h)",
        enableSorting: false,
        meta: {
          align: "right",
        },
        cell: ({ row }) => formatHours(row.original.totalTime),
      },

      {
        id: "week",
        header: "Week",
        enableSorting: false,

        accessorFn: (row) => {
          const date = new Date(row.startTime);
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
          const date = new Date(row.startTime);
          return String(getWeek(date));
        },
        above: (rows: Row[]) => {
          const totalTime = rows.reduce(
            (sum, row) => sum + (row.totalTime || 0),
            0
          );
          const regularHours = totalTime > 40 ? 40 : totalTime;
          const overtime = totalTime > 40 ? totalTime - 40 : 0;
          const week = getWeek(new Date(rows[0].startTime));
          return (
            <div className="flex flex-row items-end justify-between gap-1 pl-3">
              <div className="flex items-center gap-2 mb-1 text-lg font-bold text-primary">
                Week {week}
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex gap-4 p-2 font-medium rounded shadow bg-background text-muted-foreground">
                  <div>
                    <div className="text-xs">Regular Time</div>
                    <div className="font-bold text-foreground">
                      {formatHours(regularHours)}
                    </div>
                  </div>
                  <Separator orientation="vertical" />
                  <div>
                    <div className="text-xs">Over Time</div>
                    <div
                      className={cn(
                        "font-bold text-foreground",
                        overtime > 0 ? " text-primary" : ""
                      )}
                    >
                      {formatHours(overtime)}
                    </div>
                  </div>
                  <Separator orientation="vertical" />
                  <div>
                    <div className="text-xs">Week Total</div>
                    <div className="font-bold text-foreground">
                      {formatHours(totalTime)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      },
      date: {
        grouper: (row: Row) => {
          const date = new Date(row.startTime);
          return format(date, "yyyy-MM-dd");
        },
        spanAvailable: false,
        above: (rows: Row[]) => {
          const totalTime = rows.reduce(
            (sum, row) => sum + (row.totalTime || 0),
            0
          );
          const date = format(new Date(rows[0].startTime), "MMMM dd, yyyy");
          return (
            <>
              <td className="py-2 pl-6 font-bold bg-muted/50">{date}</td>
              <td className="bg-muted/50"></td>
              <td className="bg-muted/50"></td>
              <td className="pr-3 font-bold text-right bg-muted/50">
                {formatHours(totalTime)}
              </td>
            </>
          );
        },
      },
    }),
    []
  );

  return { columns, groupBy };
}
