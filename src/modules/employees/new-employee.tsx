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
  EmployeesForm,
  schema,
} from "@/modules/employees/employees-form";
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
  nameFirst: "",
  nameLast: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
  department: "",
  level: "",
  grade: "",
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  },
  driversLicenseNumber: "",
  driversLicenseExpDate: "",
} as const;

export function NewEmployee() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  const addEmployee = useMutation(api.employees.add);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function onSubmit(data: FormData) {
    try {
      const newEmployeeId = await addEmployee({
        ...data,
        positionIds: (data.positionIds as Id<"positions">[]) ?? [],
      });
      form.reset(defaultValues);
      navigate({
        to: `/employees`,
        search: { showAdd: false } as any,
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
          <SheetTitle>New Employee</SheetTitle>
          <SheetDescription>
            Create a new employee for your event management system.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[calc(100svh-180px)] px-6 py-1">
              <EmployeesForm form={form} />
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
