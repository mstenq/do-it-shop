"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
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
  const { data: tenantAccess } = api.tenantAccess.getByTenantId.useQuery(
    Number(params.tenantId),
  );
  return (
    <div className="container p-8">
      <div className="">
        <h1>Tenant Users</h1>
        <table className="pretty-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(tenantAccess ?? []).map(({ user }) => (
              <tr key={user?.id}>
                <td>{user?.firstName}</td>
                <td>{user?.lastName}</td>
                <td className="space-x-2">
                  <button>Delete</button>
                  <button onClick={() => setIsOpen(true)}>Login</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>Login as user</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Label>Email</Label>
            <Input type="email" placeholder="Email" />
          </div>
          <div className="flex flex-col gap-4">
            <Label>Password</Label>
            <Input type="password" placeholder="Password" />
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
