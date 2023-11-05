import { cn } from "@/utils";
import { memo, useMemo, type ReactNode } from "react";
import { Pagination, type PaginationProps } from "./Pagination";

type MaybeId = {
  id?: string | number;
};

export type Columns<T extends MaybeId> = Array<Column<T>>;
type Column<T extends MaybeId> = {
  sharedClassName?: string;
  header?: ReactNode;
  fallback?: ReactNode;
  cell: (item: T) => ReactNode;
};

type GridProps<T extends MaybeId> = {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  gridTemplate?: string;
  stickyHeader?: boolean;
  headerClass?: string;
  rowClass?: string;
  sort?: {
    sortBy: string;
    sortDirection: string;
    setSortBy: (sortBy: string) => void;
    setSortDirection: (sortDirection: string) => void;
  };
  pagination?: PaginationProps;
};

const _Grid = <T extends MaybeId>({
  data,
  columns,
  loading = false,
  gridTemplate = "default-grid",
  headerClass,
  stickyHeader = true,
  rowClass,
  sort,
  pagination,
}: GridProps<T>) => {
  console.log("RENDER GRID");

  const hasColumnFallback = useMemo(
    () => columns.some((column) => column.fallback),
    [columns],
  );

  const hasHeaders = useMemo(
    () => columns.some((column) => column.header),
    [columns],
  );

  return (
    <div className="divide-y @container">
      {/* Headers */}
      {hasHeaders && (
        <div
          className={cn(
            "font-bold text-accent-foreground",
            stickyHeader && "sticky top-0 z-10 bg-card/60 backdrop-blur",
            gridTemplate,
            headerClass,
          )}
        >
          {columns.map((column, i) => (
            <button
              key={i}
              className={cn("text-left", column.sharedClassName)}
              onClick={() => sort?.setSortBy("name")}
            >
              {column.header}
            </button>
          ))}
        </div>
      )}

      {/* Regular Loader */}
      {loading && !hasColumnFallback && (
        <div className="grid h-32 place-items-center">Loading...</div>
      )}

      {/* Skeleton Loader */}
      {loading &&
        hasColumnFallback &&
        Array.from(Array(pagination?.limit ?? 10).keys()).map((_, i) => (
          <div className={cn(gridTemplate, rowClass)} key={i}>
            {columns.map((column, i) => (
              <div key={i} className={column.sharedClassName}>
                {column.fallback}
              </div>
            ))}
          </div>
        ))}

      {/* Render List */}
      {!loading &&
        data.map((item, i) => {
          return (
            <div key={item.id ?? i} className={cn(gridTemplate, rowClass)}>
              {columns.map((column, i) => (
                <div key={i} className={cn("truncate", column.sharedClassName)}>
                  {column.cell(item)}
                </div>
              ))}
            </div>
          );
        })}

      {pagination && (
        <div className="flex items-center justify-between py-4">
          <p className="text-sm text-muted-foreground">
            {pagination?.total} found
          </p>
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};

export const Grid = memo(_Grid) as typeof _Grid;
