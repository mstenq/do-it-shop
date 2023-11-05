import { cn } from "@/utils";
import { useMemo, type ReactNode, memo } from "react";
import { Pagination } from "./Pagination";
import { useQueryState } from "@/hooks";

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
  queryKey?: string;
  totalFound?: number;
  gridTemplate?: string;
  stickyHeader?: boolean;
  headerClass?: string;
  rowClass?: string;
};

const _Grid = <T extends MaybeId>({
  data,
  columns,
  loading = false,
  queryKey,
  totalFound,
  gridTemplate = "default-grid",
  headerClass,
  stickyHeader = true,
  rowClass,
}: GridProps<T>) => {
  console.log("RENDER GRID");
  const [skip, setSkip] = useQueryState("skip" + queryKey, 0, {
    formatValue: (v: string) => Number(v),
  });
  const [limit, setLimit] = useQueryState<number>("limit" + queryKey, 10, {
    formatValue: (v: string) => Number(v),
  });

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
            <div key={i} className={column.sharedClassName}>
              {column.header}
            </div>
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
        Array.from(Array(limit).keys()).map((_, i) => (
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

      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">{totalFound} found</p>
        <Pagination
          skip={Number(skip)}
          limit={limit}
          total={totalFound}
          setSkip={setSkip}
          setLimit={setLimit}
        />
      </div>
    </div>
  );
};

export const Grid = memo(_Grid) as typeof _Grid;
