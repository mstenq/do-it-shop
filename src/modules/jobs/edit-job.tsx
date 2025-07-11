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
import { JobsForm, FormData, schema } from "@/modules/jobs/jobs-form";
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
import { toast } from "sonner";

export function EditJob() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/jobs" });

  const showEdit = search.showEdit;
  const job = useQuery(
    api.jobs.get,
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
          <SheetTitle>Edit Job</SheetTitle>
          <SheetDescription>Update the job information below</SheetDescription>
        </SheetHeader>
        {!job && <LoadingSpinner />}
        {job && <EditJobForm job={job} />}
      </SheetContent>
    </Sheet>
  );
}

function EditJobForm({ job }: { job: ConvexType<"jobs.get"> }) {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  const update = useMutation(api.jobs.update);

  const { data: validatedInput, error } = schema.safeParse({
    ...job,
    customerName: job?.customer?.name ?? "",
    dueDate: new Date(job?.dueDate ?? "").toISOString().split("T")[0] || "",
  });

  if (error) {
    toast.error("Invalid job data: " + error.message);
  }
  console.log("EditJobForm", validatedInput);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: "",
      dueDate: "",
      customerName: "",
      employeeId: "",
      notes: "",
      priority: "medium",
      status: "ready",
      quantity: "",

      ...validatedInput,
    },
  });

  useEffect(() => {
    if (!job) return;
    const validatedInput = schema.safeParse(job).data;
    form.reset(validatedInput);
  }, [job]);

  async function onSubmit(data: FormData) {
    try {
      await update({
        ...data,
        id: job._id,
        dueDate: data.dueDate ? new Date(data.dueDate).getTime() : undefined,
        employeeId: data.employeeId
          ? (data.employeeId as Id<"employees">)
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
          <JobsForm form={form} />
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
