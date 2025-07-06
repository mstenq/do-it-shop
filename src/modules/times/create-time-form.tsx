import React from "react";
import { Id } from "@convex/dataModel";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parse } from "date-fns";
import { toast } from "sonner";
import { ConvexType } from "@/utils/convex-type";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api } from "@convex/api";
import { parseDateAndTime } from "@/utils/date-utils";
import { useQuery } from "convex-helpers/react/cache";

// Form schema for time entry validation
const timeEntrySchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    date: z.string().min(1, "Date is required"),
    startTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Start time must be in HH:MM format"
      ),
    endTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "End time must be in HH:MM format"
      )
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // Validate that end time is after start time (if provided)
      if (!data.endTime) return true;

      const startMinutes = parseTimeToMinutes(data.startTime);
      const endMinutes = parseTimeToMinutes(data.endTime);

      // Allow overnight shifts (end time next day)
      return endMinutes >= startMinutes || endMinutes < startMinutes;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

type FormData = z.infer<typeof timeEntrySchema>;
type Employee = ConvexType<"employees.all">[number];

// Helper function to convert HH:MM to minutes since midnight
function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

const formItemClassName =
  "sm:grid items-center gap-4 grid-cols-[180px_1fr] col-span-full sm:space-y-0";

interface CreateTimeFormProps {
  defaultEmployeeId?: Id<"employees">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateTimeForm = ({
  defaultEmployeeId,
  onSuccess,
  onCancel,
}: CreateTimeFormProps) => {
  // Get employees for selection
  const employees = useQuery(api.employees.all, { isActive: true });

  // Setup mutation for creating time entry
  const createTime = useMutation(api.times.add);

  // Setup form using zod schema and react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      employeeId: defaultEmployeeId || "",
      date: format(new Date(), "yyyy-MM-dd"), // Default to today
      startTime: "",
      endTime: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      // Convert local times to UTC before saving
      const startDate = parseDateAndTime(data.date, data.startTime);
      const endDate = data.endTime
        ? parseDateAndTime(data.date, data.endTime)
        : undefined;

      await createTime({
        employeeId: data.employeeId as Id<"employees">,
        startTime: startDate.getTime(),
        endTime: endDate?.getTime(),
      });

      toast.success("Time entry created successfully");
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create time entry:", error);
      toast.error("Failed to create time entry");
    }
  };

  // Show loading spinner while employees are loading
  if (employees === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Render form with shadcn/ui components
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Create Time Entry</h2>

          {/* Employee Selection */}
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem className={cn(formItemClassName)}>
                <FormLabel>Employee</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees?.map((employee: Employee) => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.nameFirst} {employee.nameLast}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Input */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className={cn(formItemClassName)}>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Start Time Input */}
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className={cn(formItemClassName)}>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} placeholder="HH:MM" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Time Input */}
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem className={cn(formItemClassName)}>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    placeholder="HH:MM (optional)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Creating...
              </>
            ) : (
              "Create Time Entry"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
