import React from "react";
import { Id } from "@convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { TimeFormFields, timeEntrySchema, TimeFormData } from "./time-form";
import { api } from "@convex/api";
import {
  convertLocalTimeToUtc,
  convertUtcTimeToLocal,
} from "@/utils/date-utils";

interface EditTimeFormProps {
  id: Id<"times">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditTimeForm = ({
  id,
  onSuccess,
  onCancel,
}: EditTimeFormProps) => {
  // Get time entry by id
  const timeEntry = useQuery(api.times.get, { _id: id });

  // Setup mutation for updating time entry
  const updateTime = useMutation(api.times.update);

  // Setup form using zod schema and react-hook-form
  const form = useForm<TimeFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      employeeId: "",
      date: "",
      startTime: "",
      endTime: "",
    },
  });

  // Populate form when data loads
  React.useEffect(() => {
    if (timeEntry) {
      const localDate = format(new Date(timeEntry.date), "yyyy-MM-dd");

      form.reset({
        employeeId: timeEntry.employeeId,
        date: localDate,
        startTime: convertUtcTimeToLocal(timeEntry.startTime, timeEntry.date),
        endTime: timeEntry.endTime
          ? convertUtcTimeToLocal(timeEntry.endTime, timeEntry.date)
          : "",
      });
    }
  }, [timeEntry, form]);

  // Handle form submission
  const onSubmit = async (data: TimeFormData) => {
    try {
      // Convert local times to UTC before saving
      const utcStartTime = convertLocalTimeToUtc(data.startTime, data.date);
      const utcEndTime = data.endTime
        ? convertLocalTimeToUtc(data.endTime, data.date)
        : undefined;

      await updateTime({
        _id: id,
        startTime: utcStartTime,
        endTime: utcEndTime,
      });

      toast.success("Time entry updated successfully");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update time entry:", error);
      toast.error("Failed to update time entry");
    }
  };

  // Show loading spinner while data is loading
  if (timeEntry === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!timeEntry) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Time entry not found
      </div>
    );
  }

  // Render form with shared TimeFormFields component
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Edit Time Entry</h2>

          <TimeFormFields
            form={form}
            mode="edit"
            employeeId={timeEntry.employeeId}
            date={format(new Date(timeEntry.date), "yyyy-MM-dd")}
            isSubmitting={form.formState.isSubmitting}
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
                Updating...
              </>
            ) : (
              "Update Time Entry"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
