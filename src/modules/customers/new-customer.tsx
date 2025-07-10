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
  FormData,
  CustomersForm,
  schema,
} from "@/modules/customers/customers-form";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/ui/button";
import { Form } from "../../components/ui/form";
import { ScrollArea } from "../../components/ui/scroll-area";

const defaultValues = {
  name: "",
  address: {
    street: "",
    city: "",
    state: "",
    zip: "",
  },
} as const;

export function NewCustomer() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  const addCustomer = useMutation(api.customers.add);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function onSubmit(data: FormData) {
    try {
      const newCustomerId = await addCustomer({
        ...data,
      });
      form.reset(defaultValues);
      navigate({
        to: `/customers/$id`,
        params: { id: newCustomerId },
        search: { showAdd: false, showEdit: "" },
      });
    } catch (error) {
      console.error(error);
    }
  }

  const setOpenClose = (open: boolean) => {
    navigate({
      search: {
        ...search,
        showAdd: open,
      } as any,
    });
  };

  const showAdd = (search as any)?.showAdd || false;

  return (
    <Sheet open={showAdd} onOpenChange={setOpenClose}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader className="">
          <SheetTitle>New Customer</SheetTitle>
          <SheetDescription>Create a new customer.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[calc(100svh-180px)] px-6 py-1">
              <CustomersForm form={form} />
            </ScrollArea>
            <SheetFooter className="">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit">Add</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
