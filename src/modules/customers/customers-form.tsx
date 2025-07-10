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
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const schema = z.object({
  name: z.string().min(1, "Name is required"),
  website: z.string().url("Must be a valid URL").optional(),
  notes: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }),
});

export type FormData = z.infer<typeof schema>;

type Props = {
  form: UseFormReturn<FormData>;
  photoUrl?: string | null;
};

const formItemClassName =
  "sm:grid items-center gap-4 grid-cols-[180px_1fr] col-span-full sm:space-y-0";

export const CustomersForm = ({ form, photoUrl }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input {...field} type="url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h2 className="py-1 text-lg font-semibold">Address</h2>

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
        <FormField
          control={form.control}
          name="address.city"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} list="cities" />
              </FormControl>
              <DataList group="cities" />
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
                <Input {...field} list="states" />
              </FormControl>
              <DataList group="states" />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address.zip"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName)}>
              <FormLabel>Zip</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className={cn(formItemClassName, "pt-8")}>
              <FormLabel className="self-start">Notes</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
