import { useQueryState } from "./useQueryState";

type UseQueryProps = {
  availableFilters?: string[];
  queryKey: string;
};

export const useQueryProps = ({ queryKey }: UseQueryProps) => {
  const [sortBy, setSortBy] = useQueryState<string>(
    queryKey + "-sortBy",
    "name",
  );
  const [sortDirection, setSortDirection] = useQueryState<string>(
    queryKey + "-sortDirection",
    "asc",
  );
  const [skip, setSkip] = useQueryState(queryKey + "-skip", 0, {
    formatValue: (v: string) => Number(v),
  });
  const [limit, setLimit] = useQueryState(queryKey + "-limit", 10, {
    formatValue: (v: string) => Number(v),
  });
  const sort = { sortBy, sortDirection, setSortBy, setSortDirection };
  const pagination = { skip, limit, setSkip, setLimit } as const;
  return { pagination, sort };
};
