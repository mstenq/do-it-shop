import { cn } from "@/utils";
import { ChevronUpIcon, ChevronsUpDownIcon } from "lucide-react";

type SortIndicatorProps = {
  currentSortBy: string;
  currentSortDirection: "asc" | "desc";
  sortKey: unknown;
};

export const SortIndicator = ({
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
