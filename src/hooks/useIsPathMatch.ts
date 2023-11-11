"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";

type Options = {
  exact?: boolean;
};

export const useIsPathMatch = () => {
  const pathname = usePathname();

  const isMatch = useCallback(
    (path: string, options?: Options) => {
      return options?.exact ? pathname === path : pathname.startsWith(path);
    },
    [pathname],
  );

  return isMatch;
};
