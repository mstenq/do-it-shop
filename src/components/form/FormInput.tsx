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
import { cn } from "@/utils";
import { useCustomForm } from "./CustomFormProvider";

type FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: ReactNode;
  description?: ReactNode;
  className?: string;
} & InputProps;

export const _FormInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  className,
  ...inputProps
}: FormInputProps<TFieldValues, TName>) => {
  const { readOnly, disabled } = useCustomForm();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("col-span-full", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <Input
              {...inputProps}
              {...field}
              disabled={disabled || inputProps.disabled}
              readOnly={readOnly || inputProps.readOnly}
            />
          </FormControl>
          <div className="min-h-[16px]">
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};
