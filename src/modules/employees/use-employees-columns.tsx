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

type Row = ConvexType<"employees.all">[number];

export const EmployeeColumn = z.enum(["id", "name", "email", "phoneNumber"]);

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
      id: "id",
      accessorKey: "id",
      header: "ID",
      size: 40,
      cell: ({ row }) => (
        <div className="inline-block p-0.5 rounded text-xs font-mono border bg-primary-foreground dark:bg-primary/30 pointer-events-none">
          {row.original.id}
        </div>
      ),
    },

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

  const groupBy = {};

  return { columns, groupBy, rowActions };
};
