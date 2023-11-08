import { useCallback, useMemo, useState } from "react";

export type StateSet<T> = ReturnType<typeof useStateSet<T>>;

export const useStateSet = <T>(defaultValue: T[] | Set<T>) => {
  const [value, setValue] = useState(new Set(defaultValue));

  const add = useCallback((item: T) => {
    setValue((prev) => new Set([...Array.from(prev), item]));
  }, []);

  const remove = useCallback((item: T) => {
    setValue((prev) => {
      const next = new Set(prev);
      next.delete(item);
      return next;
    });
  }, []);

  const has = useCallback((item: T) => value.has(item), [value]);
  const clear = useCallback(() => setValue(new Set()), []);
  const size = useMemo(() => value.size, [value]);
  const values = useMemo(() => Array.from(value), [value]);

  return { add, delete: remove, has, clear, size, values };
};
