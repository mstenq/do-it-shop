import { useDeferredValue, useEffect, useState } from "react";

export const useDebouncedState = <T>(defaultValue: T, timeout = 300) => {
  const [value, setValue] = useState(defaultValue);
  const [debouncedValue, setDebouncedValue] = useState(defaultValue);
  const deferredValue = useDeferredValue(debouncedValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, timeout);
    return () => clearTimeout(timer);
  }, [value, timeout]);

  return [value, deferredValue, setValue] as const;
};
