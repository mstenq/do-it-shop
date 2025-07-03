import { House } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Fragment } from "react/jsx-runtime";
import { useRouterState } from "@tanstack/react-router";

type BreadcrumbItem = {
  title: string;
  path: string;
};

export function NavBreadcrumbs() {
  const matches = useRouterState({ select: (s) => s.matches });
  const breadcrumbs = matches
    .filter((match) => match.context.title)
    .map(({ pathname, context }) => {
      return {
        title: context.title!,
        path: pathname,
      };
    });

  // Dedupe items based on path
  const uniqueItems = breadcrumbs.reduce((acc, current) => {
    const isDuplicate = acc.find((item) => item.title === current.title);
    if (!isDuplicate) {
      acc.push(current);
    }
    return acc;
  }, [] as BreadcrumbItem[]);

  return (
    <nav className="flex items-center gap-2 ">
      <Breadcrumb>
        <BreadcrumbList>
          {uniqueItems.map((item, index) => (
            <Fragment key={index}>
              {index !== 0 && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
              <BreadcrumbItem>
                <BreadcrumbLink to={item.path}>
                  {item.title == "Dashboard" ? (
                    <House className="w-4 h-4" />
                  ) : (
                    item.title
                  )}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
}
