import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import {
  type DefaultValues,
  type UseFormReturn,
} from "react-hook-form/dist/types/form";
import { type ZodType } from "zod";
import { FormProvider } from "../ui/form";

type FormProps<T extends FieldValues = FieldValues> = {
  schema: ZodType<T>;
  defaultValues: DefaultValues<T> | undefined;
  onSubmit?: (data: T) => void;
  children: (form: UseFormReturn<T, unknown, undefined>) => ReactNode;
};

export const _Form = <T extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  children,
  onSubmit = (data: T) => {
    console.log("formData", data);
  },
}: FormProps<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="">
        {children(form)}
      </form>
    </FormProvider>
  );
};
