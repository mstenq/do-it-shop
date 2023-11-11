import { cn } from "@/utils";
import { memo, useMemo, type ReactNode, useState, useEffect } from "react";
import { Pagination } from "@/components/Pagination";
import { usePaginationSortProps } from "@/hooks";
import { SortHeader } from "./SortHeader";
import { MobileSorter } from "./MobileSorter";

export type MaybeId = {
  id?: string | number;
};

export type Columns<T extends MaybeId, SortOptions> = Array<
  Column<T, SortOptions>
>;

export type Column<T extends MaybeId, SortOptions> = {
  sharedClassName?: string;
  header?: ReactNode;
  fallback?: ReactNode;
  sortKey?: SortOptions;
  cell: (item: T) => ReactNode;
};

type GridProps<T extends MaybeId> = {
  data: T[];
  queryKey: string;
  toolbar?: ReactNode;
  columns: Column<T, unknown>[];
  loading?: boolean;
  gridTemplate?: string;
  sticky?: boolean;
  rowClass?: string;
  totalFound: number | undefined;
  onClick?: (item: T) => void;
};

const _DataGrid = <T extends MaybeId>({
  data,
  queryKey,
  toolbar,
  columns,
  loading = false,
  gridTemplate = "default-grid",
  sticky = true,
  rowClass,
  totalFound,
  onClick,
}: GridProps<T>) => {
  const [found, setFound] = useState(totalFound);
  const [lastDataLength, setLastDataLength] = useState<number | undefined>();
  const { pagination, sort } = usePaginationSortProps({ queryKey });

  const hasColumnFallback = useMemo(
    () => columns.some((column) => column.fallback),
    [columns],
  );

  const hasHeaders = useMemo(
    () => columns.some((column) => column.header),
    [columns],
  );

  useEffect(() => {
    // smooth out the transition from count to new count by ignoreing undefines between renders
    if (totalFound === undefined) return;
    setFound(totalFound);
  }, [totalFound]);

  useEffect(() => {
    // smooth out the skeleton loader by using last seen render count
    if (data.length && data.length > 0) {
      setLastDataLength(data?.length);
    }
  }, [data]);

  return (
    <div className="@container">
      {/* Headers */}
      <div className={cn("border-b bg-card ", sticky && "sticky top-0 z-10")}>
        {toolbar && <div className="p-3">{toolbar}</div>}
        <MobileSorter sort={sort} columns={columns} />
        {hasHeaders && (
          <div
            className={cn(
              "hidden border-t font-bold text-accent-foreground @2xl:grid",
              gridTemplate,
            )}
          >
            {columns.map((column, i) => (
              <SortHeader key={i} column={column} sort={sort} />
            ))}
          </div>
        )}
      </div>

      {/* Regular Loader */}
      {loading && !hasColumnFallback && (
        <div className="grid h-32 place-items-center">Loading...</div>
      )}

      {/* Skeleton Loader */}
      {loading && hasColumnFallback && (
        <div className="divide-y">
          {Array.from(
            Array(lastDataLength ?? pagination?.limit ?? 10).keys(),
          ).map((_, i) => (
            <div className={cn(gridTemplate, rowClass)} key={i}>
              {columns.map((column, i) => (
                <div key={i} className={column.sharedClassName}>
                  {column.fallback}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Render List */}
      <div className="divide-y">
        {!loading &&
          data.map((item, i) => {
            return (
              <div
                tabIndex={onClick ? 0 : -1}
                key={item.id ?? i}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "Space") {
                    e.preventDefault();
                    onClick?.(item);
                  }
                }}
                onClick={() => onClick?.(item)}
                className={cn(
                  onClick &&
                    "cursor-pointer hover:bg-accent focus:outline-none focus-visible:bg-primary/10",
                  gridTemplate,
                  rowClass,
                )}
              >
                {columns.map((column, i) => (
                  <div
                    key={i}
                    className={cn("truncate", column.sharedClassName)}
                  >
                    {column.cell(item)}
                  </div>
                ))}
              </div>
            );
          })}
      </div>

      {pagination && (
        <div
          className={cn(
            "flex items-center justify-between border-t bg-card py-4",
            sticky && "sticky bottom-0",
          )}
        >
          <div className="hidden px-4 @lg:block">
            {typeof found === "number" && (
              <p className="text-sm text-muted-foreground">
                {found}&nbsp;found
              </p>
            )}
          </div>
          <Pagination {...pagination} total={found} />
        </div>
      )}
    </div>
  );
};

export const DataGrid = memo(_DataGrid) as typeof _DataGrid;
