import { type ReactNode } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input, type InputProps } from "../ui/input";
import {
  type FieldValues,
  type Control,
  type FieldPath,
} from "react-hook-form";

type FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
} & InputProps;

export const _FormInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  ...inputProps
}: FormInputProps<TFieldValues, TName>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <Input {...inputProps} {...field} />
          </FormControl>
          <div className="min-h-[16px]">
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};
