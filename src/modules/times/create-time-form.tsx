import { ConvexType } from "@/utils/convex-type";
import { Id } from "@convex/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { parseDateAndTime } from "@/utils/date-utils";
import { api } from "@convex/api";

// Form schema for time entry validation
const timeEntrySchema = z
  .object({
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
      return endMinutes > startMinutes;
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
  employeeId: Id<"employees">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateTimeForm = ({
  employeeId,
  onSuccess,
  onCancel,
}: CreateTimeFormProps) => {
  // Setup mutation for creating time entry
  const createTime = useMutation(api.times.add);

  // Setup form using zod schema and react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
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
        employeeId: employeeId,
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

  // Render form with shadcn/ui components
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Create Time Entry</h2>

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
