"use client";

import { useIsPathMatch } from "@/hooks";
import { cn } from "@/utils";
import { type QueryObj } from "@/utils/getQueryObjFromHref";
import { newHrefWithSearchParams } from "@/utils/newHrefWithSearchParams";
import { querySub } from "@/utils/queryKeySub";
import Link from "next/link";
import { forwardRef, type ReactNode } from "react";

export type CustomLinkProps = {
  href: string;
  children: ReactNode;
  searchParams?: QueryObj;
  className?: string;
  keepSearchParams?: false | "all" | string[];
  activeClassName?: string;
  exact?: boolean;
};

export const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  function _CustomLink(
    {
      href,
      children,
      searchParams,
      keepSearchParams = "all",
      activeClassName,
      className,
      ...props
    },
    ref,
  ) {
    const isMatch = useIsPathMatch();
    const isActive = isMatch(href, { exact: props.exact });

    const { newHref, mergedQueryObj, changedKeys } = newHrefWithSearchParams({
      href,
      searchParams,
      keepSearchParams,
    });

    // const handleClick = () => {
    //   changedKeys.forEach((key) => {
    //     querySub.dispatch(key, mergedQueryObj[key] ?? "");
    //   });
    // };

    return (
      <Link
        ref={ref}
        {...props}
        className={cn(className, isActive && activeClassName)}
        href={newHref}
      >
        {children}
      </Link>
    );
  },
);
