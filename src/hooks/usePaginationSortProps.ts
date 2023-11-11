import {
  parseAsInteger,
  parseAsStringEnum,
  useQueryState,
} from "next-usequerystate";

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
  const [sortBy, setSortBy] = useQueryState(
    queryKey + "-sortBy",
    parseAsStringEnum(["name", "email", "role", "lastUpdated"]).withDefault(
      "name",
    ),
  );

  const [sortDirection, setSortDirection] = useQueryState(
    queryKey + "-sortDirection",
    parseAsStringEnum(["asc", "desc"]).withDefault("asc"),
  );

  const [skip, setSkip] = useQueryState(
    queryKey + "-skip",
    parseAsInteger.withDefault(0),
  );

  const [limit, setLimit] = useQueryState(
    queryKey + "-limit",
    parseAsInteger.withDefault(20),
  );

  const sort = {
    sortBy: sortBy as string,
    sortDirection,
    setSortBy: setSortBy as (value: string) => void,
    setSortDirection,
  };
  const pagination = { skip, limit, setSkip, setLimit } as const;
  return { pagination, sort };
};
