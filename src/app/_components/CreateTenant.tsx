"use client";

import { api } from "@/trpc/react";

export const CreateTenant = () => {
  const utils = api.useUtils();
  const { mutate } = api.tenant.createTenant.useMutation({
    onSettled() {
      utils.tenant.getAll.invalidate().catch(console.error);
    },
  });

  const { mutate: update } = api.tenant.updateTenant.useMutation({
    onSettled() {
      utils.tenant.getAll.invalidate().catch(console.error);
    },
  });

  return (
    <div>
      <button
        onClick={() => {
          console.log("TEST");
          mutate({
            tenant: {
              companyName: "Mason",
              dbUrl: "",
            },
            user: {
              firstName: "Mason",
              lastName: "Stenquist",
              email: `mason.sten+${new Date().toISOString()}@gmail.com`,
            },
            password: "rush2112",
          });
        }}
      >
        Create
      </button>
      <button
        onClick={() =>
          update({ id: 2, data: { companyName: new Date().toISOString() } })
        }
      >
        Update
      </button>
    </div>
  );
};
