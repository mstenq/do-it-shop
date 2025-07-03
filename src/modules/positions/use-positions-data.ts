import { api } from "@convex/api";
import { useQuery } from "convex-helpers/react/cache";

interface UsePositionsDataOptions {
  includeDeleted?: boolean;
}

export function usePositionsData(options: UsePositionsDataOptions = {}) {
  const { includeDeleted = false } = options;
  const data = useQuery(api.positions.all, { includeDeleted });

  return data ?? [];
}
