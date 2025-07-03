import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Position name is required"),
  schedulerColor: z.string().min(1, "Scheduler color is required"),
  requiredDriversLicense: z.boolean().default(false),
});

export type PositionFormData = z.infer<typeof formSchema>;

interface PositionFormProps {
  onSubmit: (data: PositionFormData) => void;
  defaultValues?: Partial<PositionFormData>;
  isLoading?: boolean;
  submitText?: string;
}

const formItemClassName = "space-y-2";

export function PositionForm({
  onSubmit,
  defaultValues,
  isLoading,
  submitText = "Save Position",
}: PositionFormProps) {
  const form = useForm<PositionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      schedulerColor: "#3B82F6",
      requiredDriversLicense: false,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <p className="text-sm text-muted-foreground">
              General position details and requirements
            </p>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className={cn(formItemClassName)}>
                <FormLabel>Position Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Security Guard, Event Coordinator"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The name of this position or role
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schedulerColor"
            render={({ field }) => (
              <FormItem className={cn(formItemClassName)}>
                <FormLabel>Scheduler Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      className="w-12 h-10 p-1 rounded"
                      {...field}
                    />
                    <Input
                      type="text"
                      className="flex-1 font-mono"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Color used to identify this position in scheduling views
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requiredDriversLicense"
            render={({ field }) => (
              <FormItem
                className={cn(
                  formItemClassName,
                  "flex flex-row items-start space-x-3 space-y-0"
                )}
              >
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Requires Driver's License</FormLabel>
                  <FormDescription>
                    Check if this position requires employees to have a valid
                    driver's license
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
