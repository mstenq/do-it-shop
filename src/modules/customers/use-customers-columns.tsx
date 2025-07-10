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

type Row = ConvexType<"customers.all">[number];

export const CustomerColumn = z.enum([
  "name",
  "address.street",
  "address.city",
  "address.state",
  "address.zip",
]) satisfies z.ZodType<keyof Row>;

export const CustomerSortingSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
}) satisfies z.ZodType<ColumnSort>;

export const useCustomersColumns = () => {
  const navigate = useNavigate();
  const destroyCustomer = useMutation(api.customers.destroy);
  const restoreCustomer = useMutation(api.customers.restore);

  const columns: ColumnDef<Row>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
    },
    {
      id: "address.street",
      accessorKey: "address.street",
      header: "Street Address",
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
              to: "/customers",
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
            restoreCustomer({ ids: [row._id] });
            toast.success("Customer restored");
          },
          hidden: (row: Row) => !row.isDeleted,
          icon: <Undo2Icon className="w-4 h-4" />,
        },
        {
          type: "button",
          label: "Delete",
          onClick: (row: Row) => {
            destroyCustomer({ ids: [row._id] });
            toast.success("Customer deleted");
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
