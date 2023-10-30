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
            name: "Mason",
            email: new Date().toISOString(),
            password: "rest",
            username: new Date().toISOString(),
            website: "whtwa",
            dbUrl: "URL",
          });
        }}
      >
        Create
      </button>
      <button onClick={() => update({ id: 1, data: { website: "New" } })}>
        Update
      </button>
    </div>
  );
};
