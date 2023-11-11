"use client";

import { useMobileMenuOpenAtom } from "@/atoms";
import { useIsPathMatch } from "@/hooks";
import { cn } from "@/utils";
import Link from "next/link";
import { type ReactElement, cloneElement, use } from "react";

type Props = {
  href: string;
  icon: ReactElement;
  children: React.ReactNode;
  exact?: boolean;
};

export const MainNavItem = ({ href, children, icon, exact }: Props) => {
  const isMatch = useIsPathMatch()(href, { exact });
  const { close } = useMobileMenuOpenAtom();
  return (
    <Link
      href={href}
      onClick={close}
      className={cn(
        "flex items-center gap-2 rounded-lg p-2 transition-all duration-300 hover:bg-primary/10 sm:flex-col sm:border sm:bg-background xl:flex-row xl:border-0 xl:bg-transparent",
        isMatch && "text-primary",
      )}
    >
      {cloneElement(icon, { className: "w-4" })} {children}
    </Link>
  );
};
