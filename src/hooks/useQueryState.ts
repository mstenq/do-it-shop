import { startTransition, useCallback, useEffect, useState } from "react";
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
      if (String(newValue) === String(value)) return;
      router.replace(`${pathname}?${key}=${newValue.toString()}`);
      setTimeout(() => {
        setValue(newValue.toString());
      }, 0);
    },
    [key, pathname, router, value],
  );

  useEffect(() => {
    if (urlValue === null) {
      console.log("SET DEFAULT VALUE", key, defaultValue, urlValue);
      changeValue(defaultValue?.toString() ?? "");
    }
  }, [urlValue, defaultValue, value, key, changeValue]);

  return [options.formatValue!(value), changeValue] as const;
};
