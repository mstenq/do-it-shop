import { RowActionsConfig } from "@/components/data-table-row-actions";
import { ConvexType } from "@/utils/convex-type";
import { api } from "@convex/api";
import { useNavigate } from "@tanstack/react-router";
import { ColumnDef, ColumnSort } from "@tanstack/react-table";
import { useMutation } from "convex/react";
import { PencilIcon, Undo2Icon, XIcon } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";

type Row = ConvexType<"jobs.all">[number];

export const JobColumn = z.enum([
  "customer",
  "description",
  "dueDate",
  "employee",
  "notes",
  "dueDate",
  "quantity",
  "status",
  "stage",
]) satisfies z.ZodType<keyof Row>;

export const JobSortingSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
}) satisfies z.ZodType<ColumnSort>;

export const useJobsColumns = () => {
  const navigate = useNavigate();
  const destroyJob = useMutation(api.jobs.destroy);
  const restoreJob = useMutation(api.jobs.restore);

  const columns: ColumnDef<Row>[] = [
    {
      id: "customer",
      accessorFn: (row) => row.customer?.name ?? "",
      header: "Customer",
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
    },
    {
      id: "address.city",
      accessorKey: "address.city",
      header: "City",
    },
    {
      id: "address.state",
      accessorKey: "address.state",
      header: "State",
    },
    {
      id: "address.zip",
      accessorKey: "address.zip",
      header: "Zip Code",
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
              to: "/jobs",
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
            restoreJob({ ids: [row._id] });
            toast.success("Job restored");
          },
          hidden: (row: Row) => !row.isDeleted,
          icon: <Undo2Icon className="w-4 h-4" />,
        },
        {
          type: "button",
          label: "Delete",
          onClick: (row: Row) => {
            destroyJob({ ids: [row._id] });
            toast.success("Job deleted");
          },
          hidden: (row: Row) => Boolean(row.isDeleted),
          variant: "destructive",
          icon: <XIcon className="w-4 h-4" />,
        },
      ],
    }),
    []
  );

  const groupBy = useMemo(() => ({}), []);

  return { columns, groupBy, rowActions };
};
