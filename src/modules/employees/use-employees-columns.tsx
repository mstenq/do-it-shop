import { ColumnDef, ColumnSort } from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { z } from "zod";
import { api } from "@convex/api";
import { ConvexType } from "@/utils/convexType";
import { RowActionsConfig } from "@/components/data-table-row-actions";
import { PencilIcon, XIcon, Undo2Icon } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Row = ConvexType<"employees.all">[number];

export const EmployeeColumn = z.enum([
  "name",
  "type",
  "phoneNumber",
  "isActive",
]);

export const EmployeeSortingSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
}) satisfies z.ZodType<ColumnSort>;

export const useEmployeesColumns = () => {
  const navigate = useNavigate();
  const destroyEmployee = useMutation(api.employees.destroy);
  const restoreEmployee = useMutation(api.employees.restore);

  const columns: ColumnDef<Row>[] = [
    {
      id: "name",
      accessorFn: (row) => `${row.nameFirst} ${row.nameLast}`,
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.nameFirst} {row.original.nameLast}
          </div>
          {row.original.email && (
            <div className="text-sm normal-case text-muted-foreground">
              {row.original.email}
            </div>
          )}
        </div>
      ),
    },

    {
      id: "type",
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <div className="text-sm">
            {type === "hourly" && "Hourly"}
            {type === "salary" && "Salary"}
            {type === "piece-work" && "Piece Work"}
          </div>
        );
      },
    },

    {
      id: "phoneNumber",
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => (
        <div>
          {row.original.phoneNumber || (
            <span className="text-muted-foreground">No Phone</span>
          )}
        </div>
      ),
    },

    {
      id: "isActive",
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge
            variant={"secondary"}
            className={cn(
              "text-xs",
              isActive ? "text-green-500" : "text-red-600 opacity-70"
            )}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
  ];

  const rowActions = useMemo<RowActionsConfig<Row>>(
    () => ({
      items: [
        {
          type: "button",
          label: "Edit",
          onClick: (row: Row) => {
            console.log("Edit row:", row);
            navigate({
              to: "/employees",
              search: (prev) => ({
                ...prev,
                showEdit: row._id,
                showAdd: false,
              }),
            });
          },
          icon: <PencilIcon className="w-4 h-4" />,
        },
        {
          type: "separator",
        },
        {
          type: "button",
          label: "Restore",
          onClick: (row: Row) => {
            restoreEmployee({ ids: [row._id] });
            toast.success("Employee restored");
          },
          hidden: (row: Row) => !row.isDeleted,
          icon: <Undo2Icon className="w-4 h-4" />,
        },
        {
          type: "button",
          label: "Delete",
          onClick: (row: Row) => {
            destroyEmployee({ ids: [row._id] });
            toast.success("Employee deleted");
          },
          hidden: (row: Row) => Boolean(row.isDeleted),
          variant: "destructive",
          icon: <XIcon className="w-4 h-4" />,
        },
      ],
    }),
    []
  );

  const groupBy = useMemo(
    () => ({
      type: {
        grouper: (row: Row) => row.type,
        above: (rows: Row[]) => {
          const type = rows[0]?.type;
          return (
            <div>
              {type === "hourly" && "Hourly"}
              {type === "salary" && "Salary"}
              {type === "piece-work" && "Piece Work"}
              {" (" + rows.length + ")"}
            </div>
          );
        },
      },
      isActive: {
        grouper: (row: Row) => (row.isActive ? "Active" : "Inactive"),
        above: (rows: Row[]) => {
          const isActive = rows[0]?.isActive;
          return (
            <div>
              {isActive ? "Active" : "Inactive"} ({rows.length})
            </div>
          );
        },
      },
    }),
    []
  );

  return { columns, groupBy, rowActions };
};
