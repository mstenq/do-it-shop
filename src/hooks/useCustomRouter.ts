import { querySub } from "@/utils/queryKeySub";
import { useRouter, useSearchParams } from "next/navigation";

type Options = {
  keepSearchParams: false | "all" | string[];
  scroll?: boolean;
};

const getQueryObjFromHref = (href: string) => {
  const url = new URL(href, window.location.origin);
  const searchParams = new URLSearchParams(url.search);
  const queryObj = Object.fromEntries(searchParams);

  return queryObj;
};

const filterQueryObj = (
  queryObj: Record<string, string>,
  searchParamsToKeep: false | "all" | string[],
) => {
  if (searchParamsToKeep === false) return {};

  // Return All
  if (searchParamsToKeep === "all") return queryObj;

  // Filter down to only ones we want to preserve
  return Object.fromEntries(
    Object.entries(queryObj).filter(([key]) =>
      searchParamsToKeep.includes(key),
    ),
  );
};

const getChangedQueryKeys = (
  originalQueryObj: Record<string, string>,
  newQueryObj: Record<string, string>,
) => {
  // Get keys that have changed
  const changedNewKeys = Object.keys(newQueryObj).filter(
    (key) => originalQueryObj[key] !== newQueryObj[key],
  );
  const changedOldKeys = Object.keys(originalQueryObj).filter(
    (key) => newQueryObj[key] !== originalQueryObj[key],
  );
  const changedKeys = [...new Set([...changedNewKeys, ...changedOldKeys])];
  return changedKeys;
};

const dispatchQueryChangeEvents = (
  originalQueryObj: Record<string, string>,
  newQueryObj: Record<string, string>,
) => {
  const changedKeys = getChangedQueryKeys(originalQueryObj, newQueryObj);
  changedKeys.forEach((key) => {
    querySub.dispatch(key, newQueryObj[key] ?? "");
  });
};

export const useCustomRouter = () => {
  const searchParams = useSearchParams();
  const originalQueryObj = Object.fromEntries(searchParams);

  const router = useRouter();
  const replace = router.replace.bind(router);
  const push = router.push.bind(router);

  const createNewNavigate =
    (nav: typeof push) =>
    (
      href: string,
      options: undefined | Options = { keepSearchParams: "all" },
    ): void => {
      const newQueryObj = getQueryObjFromHref(href);
      const filteredQueryObj = filterQueryObj(
        originalQueryObj,
        options?.keepSearchParams,
      );

      // Construct new href
      const mergedQueryObj = { ...filteredQueryObj, ...newQueryObj };
      const originalURL = new URL(href, window.location.origin);
      const originalHref = originalURL.pathname;
      const newHref = `${originalHref}?${new URLSearchParams(
        mergedQueryObj,
      ).toString()}`;

      nav(newHref, { scroll: options?.scroll ?? true });
      dispatchQueryChangeEvents(originalQueryObj, mergedQueryObj);
    };

  return {
    ...router,
    replace: createNewNavigate(replace),
    push: createNewNavigate(push),
  };
};
