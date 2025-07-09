import { Id } from "@convex/dataModel";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Shared form schema for time entry validation
export const timeEntrySchema = z
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

      return endMinutes > startMinutes;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export type TimeFormData = z.infer<typeof timeEntrySchema>;

// Helper functions
export function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

const formItemClassName =
  "sm:grid items-center gap-4 grid-cols-[180px_1fr] col-span-full sm:space-y-0";

interface TimeFormFieldsProps {
  form: UseFormReturn<TimeFormData>;
  mode: "create" | "edit";
  employeeId?: Id<"employees">;
  employeeName?: string;
  date?: string;
  isSubmitting?: boolean;
}

export const TimeFormFields = ({
  form,
  mode,
  employeeId,
  employeeName,
  date,
  isSubmitting = false,
}: TimeFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {/* Date Display (non-editable) */}
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className={cn(formItemClassName)}>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input value={field.value} disabled className="bg-muted" />
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
              <Input
                type="time"
                {...field}
                placeholder="HH:MM"
                disabled={isSubmitting}
              />
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
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
