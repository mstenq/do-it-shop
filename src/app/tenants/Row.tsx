import type { Tenant } from "@/server/db/tenant-schema";

export const Row = ({ tenant }: { tenant: Tenant }) => {
  return (
    <tr>
      <td>{tenant.name}</td>
      <td>{tenant.dbUrl}</td>
      <td>{tenant.updatedAt}</td>
    </tr>
  );
};
