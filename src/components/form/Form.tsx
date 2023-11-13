import { zodResolver } from "@hookform/resolvers/zod";
import { useImperativeHandle, type ReactNode, type Ref } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import {
  type DefaultValues,
  type UseFormReturn,
} from "react-hook-form/dist/types/form";
import { type ZodType } from "zod";
import { FormProvider } from "../ui/form";
import { Provider } from "jotai";
import {
  type CustomFormContextType,
  CustomFormProvider,
} from "./CustomFormProvider";

type FormProps<T extends FieldValues = FieldValues> = {
  schema: ZodType<T>;
  defaultValues: DefaultValues<T> | undefined;
  onSubmit?: (data: T) => void;
  formApi?: Ref<UseFormReturn<T, any, undefined>>;
  children: (form: UseFormReturn<T, unknown, undefined>) => ReactNode;
} & Partial<CustomFormContextType>;

export const _Form = <T extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  children,
  readOnly,
  disabled,
  formApi,
  onSubmit = (data: T) => {
    console.log("formData", data);
  },
}: FormProps<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useImperativeHandle(formApi, () => form, [form]);

  return (
    <CustomFormProvider value={{ readOnly, disabled }}>
      <FormProvider {...form}>
        <Provider>
          <form
            autoComplete="off"
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className=""
            name="lastpass-disable-search"
          >
            {children(form)}
          </form>
        </Provider>
      </FormProvider>
    </CustomFormProvider>
  );
};
