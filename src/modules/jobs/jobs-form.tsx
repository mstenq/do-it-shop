import { DataList } from "@/components/data-list";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUploadInput } from "@/components/ui/image-upload-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@convex/api";
import { useQuery } from "convex-helpers/react/cache";
import { useDeferredValue } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { EmployeePicker } from "../employees";

export const jobStatus = z.enum([
  "ready",
  "waiting",
  "in-progress",
  "back-burner",
  "completed",
]);

export const jobPriority = z.enum(["high", "medium", "low"]);

export const schema = z.object({
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().optional(),
  customerName: z.string(),
  employeeId: z.string().optional(),
  notes: z.string().optional(),
  quantity: z.string().optional(),
  status: jobStatus,
  priority: jobPriority,
});

export type FormData = z.infer<typeof schema>;

type Props = {
  form: UseFormReturn<FormData>;
};

const formItemClassName =
  "sm:grid items-center gap-4 grid-cols-[180px_1fr] col-span-full sm:space-y-0";

export const JobsForm = ({ form }: Props) => {
  // CUSTOMER NAME SEARCH
  const customerName = useWatch({ name: "customerName" });
  const deferredCustomerName = useDeferredValue(customerName);
  const customers =
    useQuery(api.search.customers, {
      q: deferredCustomerName,
    }) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-3">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <Input {...field} list="customers" />
              </FormControl>
              <datalist id="customers">
                {customers.map((customer) => (
                  <option key={customer._id} value={customer.name}>
                    {customer.name}
                  </option>
                ))}
              </datalist>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel className="self-start">Job Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel className="self-start">Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <EmployeePicker
              className={cn(formItemClassName)}
              value={field.value}
              onSelect={field.onChange}
              placeholder="leave blank for all employees"
            />
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName, "pt-6")}>
              <FormLabel className="self-start">Priority</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row items-center gap-4"
                >
                  <FormItem className="flex items-baseline gap-3">
                    <FormControl>
                      <RadioGroupItem value="high" />
                    </FormControl>
                    <FormLabel className="font-normal">High</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-baseline gap-3">
                    <FormControl>
                      <RadioGroupItem value="medium" />
                    </FormControl>
                    <FormLabel className="font-normal">Medium</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-baseline gap-3">
                    <FormControl>
                      <RadioGroupItem value="low" />
                    </FormControl>
                    <FormLabel className="font-normal">Low</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName, "pt-6")}>
              <FormLabel className="self-start">Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col "
                >
                  <FormItem className="flex items-baseline gap-3">
                    <FormControl>
                      <RadioGroupItem value="ready" />
                    </FormControl>
                    <FormLabel className="font-normal">Ready</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-baseline gap-3">
                    <FormControl>
                      <RadioGroupItem value="waiting" />
                    </FormControl>
                    <FormLabel className="font-normal">Waiting</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-baseline gap-3">
                    <FormControl>
                      <RadioGroupItem value="in-progress" />
                    </FormControl>
                    <FormLabel className="font-normal">In Progress</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-baseline gap-3">
                    <FormControl>
                      <RadioGroupItem value="back-burner" />
                    </FormControl>
                    <FormLabel className="font-normal">Back Burner</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
