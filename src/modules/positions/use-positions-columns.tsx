import { RowActionsConfig } from "@/components/data-table-row-actions";
import { Badge } from "@/components/ui/badge";
import { ConvexType } from "@/utils/convexType";
import { api } from "@convex/api";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation } from "convex/react";
import { Car, PencilIcon, Undo2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Define column enum for visibility management
export const PositionColumn = z.enum([
  "id",
  "name",
  "schedulerColor",
  "requiredDriversLicense",
]);

// Define sorting schema
export const PositionSortingSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

type Row = ConvexType<"positions.all">[number];

export function usePositionsColumns() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/positions/" });
  const destroy = useMutation(api.positions.destroy);
  const restore = useMutation(api.positions.restore);

  const columns: ColumnDef<Row>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="inline-block p-0.5 rounded text-xs font-mono border bg-primary-foreground pointer-events-none">
          {row.original.id}
        </div>
      ),
      size: 80,
      enableSorting: true,
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Position Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      enableSorting: true,
    },
    {
      id: "schedulerColor",
      accessorKey: "schedulerColor",
      header: "Scheduler Color",
      cell: ({ row }) => {
        const color = row.getValue("schedulerColor") as string;
        return color ? (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 border rounded"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-xs">{color}</span>
          </div>
        ) : null;
      },
      size: 160,
      enableSorting: false,
    },
    {
      id: "requiredDriversLicense",
      accessorKey: "requiredDriversLicense",
      header: "Driver's License",
      cell: ({ row }) => {
        const required = row.original.requiredDriversLicense;
        return required ? (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <Car className="w-3 h-3" />
            Required
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">Not required</span>
        );
      },
      size: 140,
      enableSorting: true,
    },
  ];

  const rowActions: RowActionsConfig<Row> = {
    items: [
      {
        type: "button",
        label: "Edit",
        onClick: (row: Row) => {
          navigate({
            to: "/positions",
            search: { showEdit: row.id },
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
          restore({ ids: [row._id] });
          toast.success("Record restored");
        },
        hidden: (row: Row) => !row.isDeleted,
        icon: <Undo2Icon className="w-4 h-4" />,
      },
      {
        type: "button",
        label: "Delete",
        onClick: (row: Row) => {
          destroy({ ids: [row._id] });
          toast.success("Record deleted");
        },
        hidden: (row: Row) => Boolean(row.isDeleted),
        variant: "destructive",
        icon: <XIcon className="w-4 h-4" />,
      },
    ],
  };

  return { columns, rowActions };
}
