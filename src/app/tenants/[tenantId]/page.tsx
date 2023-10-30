"use client";
import { api } from "@/trpc/react";

export default function TenantDetail({
  params,
}: {
  params: { tenantId: string };
}) {
  const { data } = api.user.getUser.useQuery(params.tenantId);
  return (
    <div className="container p-8">
      <div className="rounded border bg-gray-50 p-8">
        <h1>Tenant Detail</h1>
        <pre>{JSON.stringify(data, null, 4)}</pre>
      </div>
    </div>
  );
}
