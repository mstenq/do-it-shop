import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FormData, JobsForm, schema } from "@/modules/jobs/jobs-form";
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
  description: "",
  dueDate: "",
  customerName: "",
  employeeId: "",
  notes: "",
  stage: "todo",
  status: "normal",
  quantity: "",
} as const;

export function NewJob() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  const addJob = useMutation(api.jobs.add);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function onSubmit(data: FormData) {
    try {
      const newJobId = await addJob({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).getTime() : undefined,
        employeeId: data.employeeId
          ? (data.employeeId as Id<"employees">)
          : undefined,
      });
      form.reset(defaultValues);
      navigate({
        to: `/jobs/$id`,
        params: { id: newJobId },
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
          <SheetTitle>New Job</SheetTitle>
          <SheetDescription>Create a new job.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[calc(100svh-180px)] px-6 py-1">
              <JobsForm form={form} />
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
