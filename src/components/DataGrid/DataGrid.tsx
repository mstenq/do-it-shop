import { cn } from "@/utils";
import { memo, useMemo, type ReactNode, useState, useEffect } from "react";
import { Pagination } from "@/components/Pagination";
import { useQueryProps } from "@/hooks";
import { SortHeader } from "./SortHeader";

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
  columns: Column<T, unknown>[];
  loading?: boolean;
  gridTemplate?: string;
  stickyHeader?: boolean;
  headerClass?: string;
  rowClass?: string;
  totalFound: number | undefined;
};

const _DataGrid = <T extends MaybeId>({
  data,
  queryKey,
  columns,
  loading = false,
  gridTemplate = "default-grid",
  headerClass,
  stickyHeader = true,
  rowClass,
  totalFound,
}: GridProps<T>) => {
  console.log("RENDER GRID");
  const [found, setFound] = useState(totalFound);
  const [lastDataLength, setLastDataLength] = useState<number | undefined>();
  const { pagination, sort } = useQueryProps({ queryKey });

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
            <SortHeader key={i} column={column} sort={sort} />
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
        Array.from(Array(lastDataLength ?? pagination?.limit ?? 10).keys()).map(
          (_, i) => (
            <div className={cn(gridTemplate, rowClass)} key={i}>
              {columns.map((column, i) => (
                <div key={i} className={column.sharedClassName}>
                  {column.fallback}
                </div>
              ))}
            </div>
          ),
        )}

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
          {typeof found === "number" && (
            <p className="text-sm text-muted-foreground">{found} found</p>
          )}
          <Pagination {...pagination} total={found} />
        </div>
      )}
    </div>
  );
};

export const DataGrid = memo(_DataGrid) as typeof _DataGrid;
