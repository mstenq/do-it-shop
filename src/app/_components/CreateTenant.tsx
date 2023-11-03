"use client";

import { api } from "@/trpc/react";

export const CreateTenant = () => {
  const utils = api.useUtils();
  const { mutate: register } = api.tenant.register.useMutation({
    onSettled(data) {
      utils.tenant.getAll.invalidate().catch(console.error);
      // Hard reload just to ensure cookies are refreshed
      window.location.replace("/tenants/" + data?.tenant.id);
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
          register({
            tenant: {
              companyName: "The Test Company",
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
        Register
      </button>
      <button
        className="ml-2"
        onClick={() =>
          update({ id: 2, data: { companyName: new Date().toISOString() } })
        }
      >
        Update
      </button>
    </div>
  );
};
