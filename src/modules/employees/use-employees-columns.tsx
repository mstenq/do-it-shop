import { ColumnDef, ColumnSort } from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { z } from "zod";
import { api } from "@convex/api";
import { ConvexType } from "@/utils/convexType";
import { RowActionsConfig } from "@/components/data-table-row-actions";
import { PencilIcon, XIcon, Undo2Icon } from "lucide-react";
import { toast } from "sonner";
import { PositionBadges } from "../positions/position-badges";
import { useMemo } from "react";

type Row = ConvexType<"employees.all">[number];

export const EmployeeColumn = z.enum([
  "id",
  "name",
  "email",
  "phoneNumber",
  "positions",
  "department",
  "level",
  "grade",
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
      id: "id",
      accessorKey: "id",
      header: "ID",
      size: 40,
      cell: ({ row }) => (
        <div className="inline-block p-0.5 rounded text-xs font-mono border bg-primary-foreground pointer-events-none">
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
            <div className="text-sm text-muted-foreground">
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

    {
      id: "positions",
      accessorKey: "positions",
      header: "Positions",
      size: 300,
      cell: ({ row }) => {
        return (
          <div className="min-w-[200px]">
            <PositionBadges
              size="sm"
              positions={row.original.positions ?? []}
            />
          </div>
        );
      },
      enableSorting: false,
    },

    {
      id: "department",
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <div>
          {row.original.department || (
            <span className="text-muted-foreground">No Department</span>
          )}
        </div>
      ),
    },

    {
      id: "level",
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => (
        <div>
          {row.original.level || (
            <span className="text-muted-foreground">No Level</span>
          )}
        </div>
      ),
    },

    {
      id: "grade",
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => (
        <div>
          {row.original.grade || (
            <span className="text-muted-foreground">No Grade</span>
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

  const groupBy = {
    department: {
      grouper: (row: Row) => row.department || "No Department",
      above: (rows: Row[], depth = 0) => {
        const count = rows.length;
        const departmentName = rows[0]?.department || "No Department";
        return (
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
            <div className="text-sm font-medium">{departmentName}</div>
            <div className="text-xs text-muted-foreground">
              ({count} employees)
            </div>
          </div>
        );
      },
    },
    level: {
      grouper: (row: Row) => row.level || "No Level",
      above: (rows: Row[], depth = 0) => {
        const count = rows.length;
        const levelName = rows[0]?.level || "No Level";
        return (
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
            <div className="text-sm font-medium">{levelName}</div>
            <div className="text-xs text-muted-foreground">
              ({count} employees)
            </div>
          </div>
        );
      },
    },
  };

  return { columns, groupBy, rowActions };
};
