"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";

export default function TenantDetail({
  params,
}: {
  params: { tenantId: string };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();
  const { data: tenant } = api.tenant.getById.useQuery(Number(params.tenantId));
  const { data: tenantAccess } = api.tenantAccess.getByTenantId.useQuery(
    Number(params.tenantId),
    {
      suspense: true,
    },
  );

  const { mutate: login } = api.user.login.useMutation({
    onSettled() {
      //router refresh is not refreshing tokens access in root layout
      window.location.reload();
    },
  });

  const { mutate: createUser } = api.user.create.useMutation({
    onSettled() {
      utils.tenantAccess.getByTenantId.invalidate().catch(console.error);
    },
  });

  const [formState, setFormState] = useState({ email: "", password: "" });

  return (
    <div className="container p-8">
      <div>
        <h2 className="text-lg">{tenant?.companyName}</h2>
        <p>Created: {tenant?.createdAt}</p>
        <p>{tenant?.dbUrl}</p>
      </div>
      <div className="">
        <div className="flex justify-between py-4">
          <h2 className="text-lg">Tenant Users</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              Delete Tenant
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                createUser({
                  tenantId: Number(params.tenantId),
                  user: {
                    firstName: "John",
                    lastName: "Doe",
                    email: `mason.sten+${new Date().toISOString()}@gmail.com`,
                  },
                  password: "rush2112",
                });
              }}
            >
              Add User
            </Button>
          </div>
        </div>
        <table className="pretty-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(tenantAccess ?? []).map(({ user }) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td className="space-x-2">
                  <button>Delete</button>
                  <button
                    onClick={() => {
                      setFormState({
                        email: user.email ?? "",
                        password: "rush2112",
                      });
                      setIsOpen(true);
                    }}
                  >
                    Login
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <form
            onSubmit={() => {
              login({
                email: formState.email,
                password: formState.password,
                tenantId: Number(params.tenantId),
              });
            }}
          >
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
              <DialogDescription>Login as user</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <Label>Email</Label>
              <Input
                type="text"
                placeholder="Email"
                value={formState.email}
                onChange={(e) =>
                  setFormState((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-4">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Password"
                value={formState.password}
                onChange={(e) =>
                  setFormState((p) => ({ ...p, password: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Login</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
