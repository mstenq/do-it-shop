import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CustomersForm,
  FormData,
  schema,
} from "@/modules/customers/customers-form";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";

import { ConvexType } from "@/utils/convex-type";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/ui/button";
import { Form } from "../../components/ui/form";
import { ScrollArea } from "../../components/ui/scroll-area";

export function EditCustomer() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/customers" });

  const showEdit = search.showEdit;
  const customer = useQuery(
    api.customers.get,
    showEdit
      ? {
          id: showEdit,
        }
      : "skip"
  );

  const setOpenClose = (open: boolean) => {
    console.log("setOpenClose", open);
    navigate({
      search: {
        ...search,
        showEdit: open ? showEdit : "",
      } as any,
    });
  };

  return (
    <Sheet open={Boolean(showEdit !== "")} onOpenChange={setOpenClose}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader className="">
          <SheetTitle>Edit Customer</SheetTitle>
          <SheetDescription>
            Update the customer information below
          </SheetDescription>
        </SheetHeader>
        {!customer && <LoadingSpinner />}
        {customer && <EditCustomerForm customer={customer} />}
      </SheetContent>
    </Sheet>
  );
}

function EditCustomerForm({
  customer,
}: {
  customer: ConvexType<"customers.get">;
}) {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  const update = useMutation(api.customers.update);

  const validatedInput = schema.safeParse(customer).data;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
        ...(validatedInput?.address ? validatedInput.address : {}),
      },
      ...validatedInput,
    },
  });

  useEffect(() => {
    if (!customer) return;
    const validatedInput = schema.safeParse(customer).data;
    form.reset(validatedInput);
  }, [customer]);

  async function onSubmit(data: FormData) {
    try {
      await update({
        ...data,
        id: customer._id,
      });
      navigate({
        search: {
          ...search,
          showEdit: "",
        } as any,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ScrollArea className="max-h-[calc(100svh-180px)] px-6 py-1">
          <CustomersForm form={form} photoUrl={customer.photo} />
        </ScrollArea>
        <SheetFooter className="">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button type="submit">Update</Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
