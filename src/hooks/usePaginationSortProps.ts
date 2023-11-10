import { z } from "zod";
import { useQueryState } from "./useQueryState";

type UsePaginationSortProps = {
  availableFilters?: string[];
  queryKey: string;
};

export type SortProps = {
  sortBy: string;
  sortDirection: "asc" | "desc";
  setSortBy: (sortBy: string) => void;
  setSortDirection: (sortDirection: "asc" | "desc") => void;
};

export type PaginationProps = {
  skip: number;
  limit: number;
  setSkip: (skip: number) => void;
  setLimit: (limit: number) => void;
};

type UsePaginationSortReturn = {
  sort: SortProps;
  pagination: PaginationProps;
};

export const usePaginationSortProps = ({
  queryKey,
}: UsePaginationSortProps): UsePaginationSortReturn => {
  const [sortBy, setSortBy] = useQueryState<string>({
    key: queryKey + "-sortBy",
    validator: (value) =>
      z
        .enum(["name", "email", "role", "lastUpdated"])
        .catch("name")
        .parse(value),
  });

  const [sortDirection, setSortDirection] = useQueryState({
    key: queryKey + "-sortDirection",
    validator: (value) => z.enum(["asc", "desc"]).catch("asc").parse(value),
  });

  const [skip, setSkip] = useQueryState({
    key: queryKey + "-skip",
    validator: (value) => z.coerce.number().nonnegative().catch(0).parse(value),
  });

  const [limit, setLimit] = useQueryState({
    key: queryKey + "-limit",
    validator: (value) => z.coerce.number().positive().catch(20).parse(value),
  });

  const sort = { sortBy, sortDirection, setSortBy, setSortDirection };
  const pagination = { skip, limit, setSkip, setLimit } as const;
  return { pagination, sort };
};
