import { type SortProps } from "@/hooks";
import { useMemo } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { type Columns, type MaybeId } from "./DataGrid";
import { SortIndicator } from "./SortIndicator";

type MobileSorterProps<T extends MaybeId> = {
  columns: Columns<T, unknown>;
  sort: SortProps;
};
export const MobileSorter = <T extends MaybeId>({
  columns,
  sort,
}: MobileSorterProps<T>) => {
  const sortableColumns = useMemo(
    () => columns.filter((column) => Boolean(column.sortKey)),
    [columns],
  );

  const currentSortByColumn = useMemo(
    () => sortableColumns.find((column) => column.sortKey === sort.sortBy),
    [sortableColumns, sort.sortBy],
  );

  if (sortableColumns.length === 0) return null;

  return (
    <div className="flex gap-[-1px] px-3 pb-3 @2xl:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start rounded-r-none border-dashed"
          >
            {currentSortByColumn?.header ? (
              <div>Sorted by {currentSortByColumn.header}</div>
            ) : (
              "Sort By..."
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {sortableColumns.map((column) => (
            <DropdownMenuCheckboxItem
              key={String(column.sortKey)}
              checked={sort.sortBy === column.sortKey}
              onCheckedChange={() => sort.setSortBy(String(column.sortKey))}
            >
              {column.header}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        onClick={() => {
          sort.setSortDirection(sort.sortDirection === "asc" ? "desc" : "asc");
        }}
        variant="outline"
        size="sm"
        className="-ml-px min-w-[40px] rounded-l-none bg-accent"
      >
        <SortIndicator
          currentSortBy={"always_show"}
          sortKey={"always_show"}
          currentSortDirection={sort.sortDirection}
        />
      </Button>
    </div>
  );
};
