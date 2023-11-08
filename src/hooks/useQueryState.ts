import { querySub } from "@/utils/queryKeySub";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryChangeQueue } from "./useQueryChangeQueue";

type QueryStateOptions<T> = {
  key: string;
  validator: (...args: unknown[]) => T;
};

type QueryStateReturn<T> = [T, (newValue: T) => void];

export const useQueryState = <T>({
  key,
  validator,
}: QueryStateOptions<T>): QueryStateReturn<T> => {
  const searchParams = useSearchParams();
  const currentSearchParam = searchParams.get(key);
  const validatedCurrent = validator(currentSearchParam);
  const [value, setValue] = useState<T>(validatedCurrent);
  const isFirstRun = useRef(true);

  const enqueuQueryChange = useQueryChangeQueue();

  const changeValue = useCallback(
    (newValue: T) => {
      if (String(newValue) === currentSearchParam && newValue === value) return;
      console.log("CHANGE VALUE", key, newValue, value, currentSearchParam);

      enqueuQueryChange(key, String(newValue));
    },
    [value, key, currentSearchParam, enqueuQueryChange],
  );

  useEffect(() => {
    const unsubscribe = querySub.onChange(key, (newValue) => {
      // Do String comparison of values, to avoid unnecessary rerenders
      if (String(value) === String(newValue)) return;

      const validatedNewValue = validator(newValue);
      setValue(validatedNewValue);
    });

    return () => {
      unsubscribe();
    };
  }, [key, validator, value, changeValue]);

  // On First Run Make Sure Query params Are Set
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (String(currentSearchParam) === String(value)) return;
    enqueuQueryChange(key, String(value));
  }, [currentSearchParam, value, key, enqueuQueryChange]);

  return [value, changeValue];
};
