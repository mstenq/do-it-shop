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
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const schema = z.object({
  nameFirst: z.string().min(1, "First name is required"),
  nameLast: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  photoStorageId: z.string().optional(),
  type: z.enum(["hourly", "salary", "piece-work"]),
});

export type FormData = z.infer<typeof schema>;

type Props = {
  form: UseFormReturn<FormData>;
  photoUrl?: string | null;
};

const formItemClassName =
  "sm:grid items-center gap-4 grid-cols-[180px_1fr] col-span-full sm:space-y-0";

export const EmployeesForm = ({ form, photoUrl }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-3">
        <h2 className="py-1 text-lg font-semibold">Basic Information</h2>

        <FormField
          control={form.control}
          name="nameFirst"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nameLast"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel className="self-start">Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hourly" id="hourly" />
                      <Label htmlFor="hourly">Hourly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="salary" id="salary" />
                      <Label htmlFor="salary">Salary</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="piece-work" id="piece-work" />
                      <Label htmlFor="piece-work">Piece Work</Label>
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormDescription className="col-start-2 pb-2">
                Active Hourly will show up on the dashboard
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photoStorageId"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel className="self-start">Image</FormLabel>
              <FormControl>
                <ImageUploadInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Drop a photo here, or click to select"
                  existingImageUrl={photoUrl}
                />
              </FormControl>
              <FormMessage className="col-start-2 !-mt-2" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
