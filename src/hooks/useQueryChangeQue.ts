import { type QueryObj } from "@/utils/getQueryObjFromHref";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { useCustomRouter } from "./useCustomRouter";

const queryQueue = new Set<QueryObj>();
let timer: NodeJS.Timeout | null = null;

export const useQueryChangeQueue = () => {
  const pathname = usePathname();
  const router = useCustomRouter();

  const processQue = useCallback(() => {
    if (queryQueue.size === 0) return;

    // merge all queries into one giant query object, for a single change
    let mergedQueryObj = {};
    queryQueue.forEach((queryObj) => {
      mergedQueryObj = { ...mergedQueryObj, ...queryObj };
    });

    // Update router with all batched changes
    router.replace(pathname, {
      searchParams: mergedQueryObj,
      scroll: false,
    });

    // clear the queue
    queryQueue.clear();
  }, [pathname, router]);

  const enqueue = (key: string, value: string) => {
    queryQueue.add({ [key]: value });

    if (timer) {
      clearTimeout(timer);
    }

    // process queue on next tick
    timer = setTimeout(processQue, 0);
  };

  return enqueue;
};
