import { type SortProps } from "@/hooks";
import { cn } from "@/utils";
import { type Column, type MaybeId } from "./DataGrid";
import { SortIndicator } from "./SortIndicator";

type SortHeaderProps<T extends MaybeId> = {
  column: Column<T, unknown>;
  sort: SortProps;
};

export const SortHeader = <T extends MaybeId>({
  column,
  sort,
}: SortHeaderProps<T>) => {
  const hasSortKey = Boolean(column.sortKey);
  const handleSortClick = () => {
    if (!hasSortKey) return;
    if (sort.sortBy === column.sortKey) {
      if (sort.sortDirection === "asc") {
        sort.setSortDirection("desc");
      } else {
        sort.setSortDirection("asc");
      }
    } else {
      sort.setSortBy(column.sortKey as typeof sort.sortBy);
      sort.setSortDirection("asc");
    }
  };
  return (
    <button
      className={cn(
        "flex items-center gap-1",
        column.sharedClassName?.includes("text-right") && "flex-row-reverse",
        !hasSortKey && "cursor-default",
        column.sharedClassName,
      )}
      onClick={handleSortClick}
    >
      {column.header}
      <SortIndicator
        currentSortBy={sort.sortBy}
        currentSortDirection={sort.sortDirection}
        sortKey={column.sortKey}
      />
    </button>
  );
};
