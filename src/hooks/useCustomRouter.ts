import { type QueryObj } from "@/utils/getQueryObjFromHref";
import { newHrefWithSearchParams } from "@/utils/newHrefWithSearchParams";
import { querySub } from "@/utils/queryKeySub";
import { useRouter } from "next/navigation";

type CustomerRouterOptions = {
  searchParams: QueryObj;
  keepSearchParams?: false | "all" | string[];
  scroll?: boolean;
};

export const useCustomRouter = () => {
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

      const { newHref, mergedQueryObj, changedKeys } = newHrefWithSearchParams({
        href,
        searchParams: options?.searchParams,
        keepSearchParams: options?.keepSearchParams,
      });

      nav(newHref, { scroll: options?.scroll ?? true });

      // changedKeys.forEach((key) => {
      //   querySub.dispatch(key, mergedQueryObj[key] ?? "");
      // });
    };

  return {
    ...router,
    replace: createNewNavigate(replace),
    push: createNewNavigate(push),
  };
};
