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

export const jobStage = z.enum([
  "todo",
  "in-progress",
  "back-burner",
  "completed",
]);

export const jobStatus = z.enum(["hot", "cold", "normal"]);

export const schema = z.object({
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().optional(),
  customerName: z.string(),
  employeeId: z.string().optional(),
  notes: z.string().optional(),
  quantity: z.string().optional(),
  stage: jobStage,
  status: jobStatus,
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
              <FormLabel className="self-start">Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
