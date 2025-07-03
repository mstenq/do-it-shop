import { cn } from "@/lib/utils";
import { FileRouteTypes } from "@/routeTree.gen";
import { Link, useMatch } from "@tanstack/react-router";

type Tab = {
  label: string;
  path: FileRouteTypes["to"];
  badgeContent?: number | string;
  badgeClassName?: string;
};

type Props = {
  tabs: Tab[];
  className?: string;
};

export const PageTabs = ({ tabs, className }: Props) => {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground gap-1",
        className
      )}
    >
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          activeOptions={{ exact: true }}
          role="tab"
          className={cn(
            "inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-md px-4 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[status=active]:bg-background data-[status=active]:text-foreground data-[status=active]:shadow",
            className
          )}
        >
          <span>{tab.label}</span>
          {tab.badgeContent !== undefined && (
            <span
              className={cn(
                "px-2  text-[10px] rounded bg-secondary",
                tab.badgeClassName
              )}
            >
              {tab.badgeContent}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
};
