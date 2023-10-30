import { api } from "@/trpc/server";
import { Suspense } from "react";
import { CreateTenant } from "./_components/CreateTenant";

export default async function Home() {
  const hello = await api.post.hello.query({ text: "from tRPC" });
  const secret = await api.post.getSecretMessage.query();

  const tenantData = await api.tenant.getAll.query();

  return (
    <main>
      <pre>{JSON.stringify(tenantData, null, 2)}</pre>
      {hello.greeting}
      {secret}
      <CreateTenant />
    </main>
  );
}
