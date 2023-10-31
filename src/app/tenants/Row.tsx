import type { Tenant } from "@/server/db/tenant-schema";
import { api } from "@/trpc/react";
import Link from "next/link";

export const Row = ({ tenant }: { tenant: Tenant }) => {
  const utils = api.useUtils();
  const deleteTenant = api.tenant.deleteTenant.useMutation({
    onError(err) {
      alert(err.message);
    },
    onSettled() {
      utils.tenant.getAll.invalidate().catch(console.error);
    },
  });
  return (
    <tr>
      <td>
        <Link className=" hover:underline" href={`/tenants/${tenant.id}`}>
          {tenant.id} - {tenant.companyName}
        </Link>
      </td>
      <td>{tenant.dbUrl}</td>
      <td>{tenant.updatedAt}</td>
      <td>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this tenant?")) {
              deleteTenant.mutate({ id: tenant.id });
            }
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
};
