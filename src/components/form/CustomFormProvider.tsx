import {
  createContext,
  useContext,
  type PropsWithChildren,
  type ContextType,
} from "react";

const CustomFormContext = createContext({ readOnly: false, disabled: false });

export type CustomFormContextType = ContextType<typeof CustomFormContext>;

const defaultValues: CustomFormContextType = {
  readOnly: false,
  disabled: false,
};

export const CustomFormProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: Partial<CustomFormContextType> }>) => {
  return (
    <CustomFormContext.Provider value={{ ...defaultValues, ...value }}>
      {children}
    </CustomFormContext.Provider>
  );
};

export const useCustomForm = () => useContext(CustomFormContext);
