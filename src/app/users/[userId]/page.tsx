"use client";

import { LayoutDetail } from "@/components/layouts/LayoutDetail";
import { api } from "@/trpc/react";
import dayjs from "@/libs/dayjs";
import { Button, SubmitButton } from "@/components/ui/button";
import { Form } from "@/components/form";
import { updateUserSchema } from "@/server/db/tenant-schema";
import { Separator } from "@/components/ui/separator";
import { useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useAutoAnimate } from "@formkit/auto-animate/react";

type Props = {
  params: {
    userId: string;
  };
};

export default function UserDetailPage({ params }: Props) {
  const [editing, setEditing] = useState(false);
  const [autoAnimate] = useAutoAnimate();
  const utils = api.useUtils();
  const { data: user } = api.user.get.useQuery(Number(params.userId));
  const { mutateAsync: updateUser } = api.user.update.useMutation({
    onSuccess: () => {
      setEditing(false);
      utils.user
        .invalidate()
        .then()
        .catch((e) => console.error(e));
    },
  });
  const formApi = useRef<UseFormReturn>(null);
  if (!user) return <div>Loading...</div>;
  return (
    <LayoutDetail
      title={`${user.firstName} ${user.lastName}`}
      subtitle={`Created ${dayjs.utc(user.createdAt).local().format("lll")}`}
      backLink={{
        url: "/users",
        text: "Users List",
      }}
      actions={
        <>
          <Button variant="negative">Delete</Button>
          {!editing && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          {editing && (
            <Button
              variant="secondary"
              onClick={() => {
                setEditing(false);
                formApi.current?.reset();
              }}
            >
              Cancel
            </Button>
          )}
        </>
      }
    >
      <Form
        schema={updateUserSchema}
        defaultValues={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        }}
        readOnly={!editing}
        formApi={formApi}
        onSubmit={(values) => updateUser({ id: user.id!, user: values })}
      >
        {(form) => (
          <div className="grid grid-cols-2 gap-x-4 border-t pt-8 ">
            <Form.Input
              control={form.control}
              name="firstName"
              label="First Name"
              className=" sm:col-span-1"
            />
            <Separator className="col-span-full mb-8 mt-1 sm:hidden" />
            <Form.Input
              control={form.control}
              name="lastName"
              label="Last Name"
              className="sm:col-span-1"
            />
            <Separator className="col-span-full mb-8 mt-1" />
            <Form.Input control={form.control} name="email" label="Email" />
            <Separator className="col-span-full mb-8 mt-1" />
            <Form.Input control={form.control} name="role" label="Role" />
            <div ref={autoAnimate}>
              {editing && (
                <div>
                  <SubmitButton>Update User</SubmitButton>
                </div>
              )}
            </div>
          </div>
        )}
      </Form>
    </LayoutDetail>
  );
}
