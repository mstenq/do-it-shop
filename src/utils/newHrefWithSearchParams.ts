"use client";

import { filterObjByKeys } from "./filterObjByKeys";
import { getChangedKeys } from "./getChangedKeys";
import { type QueryObj } from "./getQueryObjFromHref";

export const newHrefWithSearchParams = ({
  href,
  searchParams,
  keepSearchParams,
}: {
  href: string;
  searchParams: QueryObj | undefined;
  keepSearchParams?: false | "all" | string[];
}) => {
  const originalSearchParams = new URLSearchParams(window.location.search);
  const originalQueryObj = Object.fromEntries(originalSearchParams);

  const filteredQueryObj = filterObjByKeys(
    originalQueryObj,
    keepSearchParams ?? "all",
  );

  // Construct new href
  const mergedQueryObj = { ...filteredQueryObj, ...searchParams };
  const originalURL = new URL(href, window.location.origin);
  const originalHref = originalURL.pathname;
  const newHref = `${originalHref}?${new URLSearchParams(
    mergedQueryObj,
  ).toString()}`;

  const changedKeys = getChangedKeys(originalQueryObj, mergedQueryObj);

  return { newHref, mergedQueryObj, changedKeys };
};
