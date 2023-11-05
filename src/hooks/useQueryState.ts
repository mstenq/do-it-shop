import { useCallback, useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { querySub } from "@/utils/queryKeySub";
import { useCustomRouter } from "./useCustomRouter";

type QueryStateOptions<T> = {
  formatValue?: (value: string) => T;
};

export const useQueryState = <T>(
  key: string,
  defaultValue: string | number | boolean,
  options: QueryStateOptions<T> = { formatValue: (value) => value as T },
) => {
  const pathname = usePathname();
  const router = useCustomRouter();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get(key);
  const [value, setValue] = useState(urlValue ?? "");

  useEffect(() => {
    const unsubscribe = querySub.onChange(key, (value) => {
      setValue(value);
    });

    return () => {
      unsubscribe();
    };
  }, [key]);

  const changeValue = useCallback(
    (newValue: string | number | boolean) => {
      console.log("changeValue", newValue, value);
      if (String(newValue) === String(value)) return;
      setValue(newValue.toString());
      router.replace(`${pathname}?${key}=${newValue.toString()}`);
    },
    [key, pathname, router, value],
  );

  useEffect(() => {
    if (urlValue === null) {
      changeValue(defaultValue?.toString() ?? "");
    }
  }, [urlValue, defaultValue, value, changeValue]);

  return [options.formatValue!(value), changeValue] as const;
};
