import { ColumnDef, ColumnSort } from "@tanstack/react-table";
import { z } from "zod";
import { ConvexType } from "@/utils/convex-type";
import { cn } from "@/lib/utils";

type Row = ConvexType<"paySchedule.all">[number];

export const PayScheduleColumn = z.enum([
  "name",
  "isCurrentPayPeriod",
  "year",
  "startDate",
  "endDate",
]);

export const PayScheduleSortingSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
}) satisfies z.ZodType<ColumnSort>;

export const usePayScheduleColumns = () => {
  const columns: ColumnDef<Row>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Pay Period Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      size: 200,
      enableSorting: true,
    },
    {
      id: "isCurrentPayPeriod",
      accessorFn: (row) => {
        const today = new Date();
        const startDate = new Date(row.startDate);
        const endDate = new Date(row.endDate);
        return today >= startDate && today <= endDate;
      },
      enableSorting: false,
      header: "Status",
      cell: ({ row }) => {
        let status: "past" | "current" | "future" | undefined;
        const today = new Date();
        const startDate = new Date(row.original.startDate);
        const endDate = new Date(row.original.endDate);
        if (today < startDate) {
          status = "future";
        } else if (today >= startDate && today <= endDate) {
          status = "current";
        } else {
          status = "past";
        }

        return (
          <div
            className={cn(
              "flex items-center gap-2",
              status === "past" && "text-muted-foreground"
            )}
          >
            <div
              className={`w-2 h-2 rounded-full ${status === "current" ? "bg-green-500" : status === "past" ? "bg-gray-500" : "bg-blue-500"}`}
            ></div>
            {status}
          </div>
        );
      },
    },
    {
      id: "year",
      accessorKey: "year",
      header: "Year",
      meta: {
        align: "right",
      },
      cell: ({ row }) => <div className="text-right">{row.original.year}</div>,
      size: 80,
      enableSorting: true,
    },
    {
      id: "startDate",
      accessorKey: "startDate",
      header: "Start Date",
      meta: {
        align: "right",
      },
      cell: ({ row }) => (
        <div className="text-right">
          {new Date(row.original.startDate).toLocaleDateString()}
        </div>
      ),
      size: 120,
      enableSorting: true,
    },
    {
      id: "endDate",
      accessorKey: "endDate",
      header: "End Date",
      meta: {
        align: "right",
      },
      cell: ({ row }) => (
        <div className="text-right">
          {new Date(row.original.endDate).toLocaleDateString()}
        </div>
      ),
      size: 120,
      enableSorting: true,
    },
  ];

  const rowActions: ColumnDef<Row> = {
    id: "actions",
    cell: () => null, // No actions needed since records are auto-generated
    size: 60,
    enableSorting: false,
  };

  const groupBy = {
    year: {
      grouper: (row: Row) => String(row.year),
      above: (rows: Row[]) => {
        return String(rows[0].year);
      },
    },
  };

  return { columns, rowActions, groupBy };
};
