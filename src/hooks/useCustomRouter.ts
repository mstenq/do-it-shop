import { getChangedKeys } from "@/utils/getChangedKeys";
import { type QueryObj } from "@/utils/getQueryObjFromHref";
import { querySub } from "@/utils/queryKeySub";
import { useRouter, useSearchParams } from "next/navigation";

type CustomerRouterOptions = {
  searchParams: QueryObj;
  keepSearchParams?: false | "all" | string[];
  scroll?: boolean;
};

const filterQueryObj = (
  queryObj: QueryObj,
  searchParamsToKeep: false | "all" | string[],
) => {
  // keep none of the original query params
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

export const useCustomRouter = () => {
  const searchParams = useSearchParams();
  const originalQueryObj = Object.fromEntries(searchParams);

  const router = useRouter();
  const replace = router.replace.bind(router);
  const push = router.push.bind(router);

  const createNewNavigate =
    (nav: typeof push) =>
    (href: string, options?: undefined | CustomerRouterOptions): void => {
      // Ensure searchParams are sent as an object
      if (href.includes("?")) {
        throw new Error(
          "useCustomRouter: href should not include query params. Use options.searchParams instead.",
        );
      }

      //   const newQueryObj = getQueryObjFromHref(href);
      const filteredQueryObj = filterQueryObj(
        originalQueryObj,
        options?.keepSearchParams ?? "all",
      );

      // Construct new href
      const mergedQueryObj = { ...filteredQueryObj, ...options?.searchParams };
      const originalURL = new URL(href, window.location.origin);
      const originalHref = originalURL.pathname;
      const newHref = `${originalHref}?${new URLSearchParams(
        mergedQueryObj,
      ).toString()}`;

      nav(newHref, { scroll: options?.scroll ?? true });

      const changedKeys = getChangedKeys(originalQueryObj, mergedQueryObj);
      changedKeys.forEach((key) => {
        querySub.dispatch(key, mergedQueryObj[key] ?? "");
      });
    };

  return {
    ...router,
    replace: createNewNavigate(replace),
    push: createNewNavigate(push),
  };
};
