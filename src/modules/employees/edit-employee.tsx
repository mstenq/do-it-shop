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
  EmployeesForm,
  FormData,
  schema,
} from "@/modules/employees/employees-form";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";

import { ConvexType } from "@/utils/convexType";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/ui/button";
import { Form } from "../../components/ui/form";
import { ScrollArea } from "../../components/ui/scroll-area";

export function EditEmployee() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/employees" });

  const showEdit = search.showEdit;
  const employee = useQuery(
    api.employees.get,
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
          <SheetTitle>Edit Employee</SheetTitle>
          <SheetDescription>
            Update the employee information below
          </SheetDescription>
        </SheetHeader>
        {!employee && <LoadingSpinner />}
        {employee && <EditEmployeeForm employee={employee} />}
      </SheetContent>
    </Sheet>
  );
}

function EditEmployeeForm({
  employee,
}: {
  employee: ConvexType<"employees.get">;
}) {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  const update = useMutation(api.employees.update);

  const validatedInput = schema.safeParse(employee).data;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nameFirst: "",
      nameLast: "",
      email: "",
      phoneNumber: "",
      ...validatedInput,
    },
  });

  useEffect(() => {
    if (!employee) return;
    const validatedInput = schema.safeParse(employee).data;
    form.reset(validatedInput);
  }, [employee]);

  async function onSubmit(data: FormData) {
    try {
      await update({
        ...data,
        id: employee._id,
        photoStorageId: data.photoStorageId
          ? (data.photoStorageId as Id<"_storage">)
          : undefined,
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
          <EmployeesForm form={form} photoUrl={employee.photo} />
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
