import { cn } from "@/utils";
import { type Column, type MaybeId } from "./DataGrid";
import {
  ChevronUpIcon,
  ChevronsUpDownIcon,
  ChevronsUpIcon,
} from "lucide-react";

type SortHeaderProps<T extends MaybeId> = {
  column: Column<T, unknown>;
  sort: {
    sortBy: string;
    setSortBy: (sortBy: string) => void;
    sortDirection: "asc" | "desc";
    setSortDirection: (sortDirection: "asc" | "desc") => void;
  };
};

type SortIndicatorProps = {
  currentSortBy: string;
  currentSortDirection: "asc" | "desc";
  sortKey: unknown;
};
const SortIndicator = ({
  currentSortBy,
  currentSortDirection,
  sortKey,
}: SortIndicatorProps) => {
  if (typeof sortKey !== "string") return null;

  if (currentSortBy === sortKey) {
    return (
      <ChevronUpIcon
        className={cn(
          "w-3 transition-all duration-300",
          currentSortDirection === "asc" && "rotate-180",
        )}
      />
    );
  }
  return <ChevronsUpDownIcon className="w-3" />;
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
      {/* <ChevronsUpDownIcon className="w-3" /> */}
    </button>
  );
};
