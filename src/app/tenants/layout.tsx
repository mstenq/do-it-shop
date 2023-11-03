"use client";

import { api } from "@/trpc/react";
import { Row } from "./Row";
import { CreateTenant } from "../_components/CreateTenant";

export default function Home({ children }: { children: React.ReactNode }) {
  const { data: tenantData } = api.tenant.getAll.useQuery();

  return (
    <main>
      {children}
      <div className="container p-8">
        <CreateTenant />
        <table className="pretty-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>url</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenantData?.map((tenant) => (
              <Row key={tenant.id} tenant={tenant} />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
