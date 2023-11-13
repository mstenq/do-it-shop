"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  backLink?: {
    url: string;
    text: string;
  };
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export const LayoutDetail = ({
  backLink,
  title,
  subtitle,
  actions,
  children,
}: Props) => {
  return (
    <main className="p-8">
      <div className="flex items-end justify-between pb-6">
        <div>
          {backLink && (
            <Link
              href={backLink.url}
              className="flex w-fit items-center gap-1 text-xs text-gray-600 hover:text-primary hover:underline dark:text-gray-400"
            >
              <ArrowLeft className="w-3" /> {backLink.text}
            </Link>
          )}
          <h1 className="py-1 font-semibold leading-7">{title}</h1>
          {subtitle && (
            <h2 className=" text-sm text-gray-600 dark:text-gray-400 ">
              {subtitle}
            </h2>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {children}
    </main>
  );
};
