"use client";

import { type QueryObj } from "@/utils/getQueryObjFromHref";
import { newHrefWithSearchParams } from "@/utils/newHrefWithSearchParams";
import { querySub } from "@/utils/queryKeySub";
import Link from "next/link";
import { forwardRef, type ReactNode } from "react";

type CustomLinkProps = {
  href: string;
  children: ReactNode;
  searchParams?: QueryObj;
  className?: string;
  keepSearchParams?: false | "all" | string[];
};

export const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  function _CustomLink(
    { href, children, searchParams, keepSearchParams = "all", ...props },
    ref,
  ) {
    const { newHref, mergedQueryObj, changedKeys } = newHrefWithSearchParams({
      href,
      searchParams,
      keepSearchParams,
    });

    const handleClick = () => {
      changedKeys.forEach((key) => {
        querySub.dispatch(key, mergedQueryObj[key] ?? "");
      });
    };

    return (
      <Link ref={ref} {...props} href={newHref} onClick={handleClick}>
        {children}
      </Link>
    );
  },
);
