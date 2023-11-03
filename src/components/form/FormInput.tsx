import { type ReactNode } from "react";
import {
  ShadFormControl,
  ShadFormDescription,
  ShadFormField,
  ShadFormItem,
  ShadFormLabel,
  ShadFormMessage,
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

export const FormInput = <
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
    <ShadFormField
      control={control}
      name={name}
      render={({ field }) => (
        <ShadFormItem>
          {label && <ShadFormLabel>{label}</ShadFormLabel>}
          {description && (
            <ShadFormDescription>{description}</ShadFormDescription>
          )}
          <ShadFormControl>
            <Input {...inputProps} {...field} />
          </ShadFormControl>
          <div className="min-h-[16px]">
            <ShadFormMessage />
          </div>
        </ShadFormItem>
      )}
    />
  );
};
