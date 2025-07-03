import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormPositionMultiPicker } from "../positions";

export const schema = z.object({
  nameFirst: z.string().min(1, "First name is required"),
  nameLast: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),

  positionIds: z.array(z.string()).optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  grade: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  driversLicenseNumber: z.string().optional(),
  driversLicenseExpDate: z.string().optional(),
});

export type FormData = z.infer<typeof schema>;

type Props = {
  form: UseFormReturn<FormData>;
};

const formItemClassName =
  "sm:grid items-center gap-4 grid-cols-[180px_1fr] col-span-full sm:space-y-0";

export const EmployeesForm = ({ form }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="py-1 text-lg font-semibold">Basic Information</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>

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
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-1">
        <h2 className="py-1 text-lg font-semibold">Event Information</h2>

        <FormField
          control={form.control}
          name="positionIds"
          render={({ field }) => (
            <FormPositionMultiPicker
              label="Positions"
              value={field.value}
              onValueChange={field.onChange}
              className={cn(formItemClassName)}
            />
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Level</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Grade</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-1">
        <h2 className="py-1 text-lg font-semibold">Address Information</h2>

        <FormField
          control={form.control}
          name="address.street"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem className={cn(formItemClassName)}>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.state"
            render={({ field }) => (
              <FormItem className={cn(formItemClassName)}>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="address.zipCode"
            render={({ field }) => (
              <FormItem className={cn(formItemClassName)}>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.country"
            render={({ field }) => (
              <FormItem className={cn(formItemClassName)}>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="py-1 text-lg font-semibold">Driver's License</h2>

        <FormField
          control={form.control}
          name="driversLicenseNumber"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>License Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="driversLicenseExpDate"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Expiration Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
