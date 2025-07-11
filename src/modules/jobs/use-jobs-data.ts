import { api } from "@convex/api";
import { useQuery } from "convex-helpers/react/cache";

export const useJobsData = (
  options: {
    includeCompleted?: boolean;
    includeDeleted?: boolean;
  } = {}
) => {
  const jobs = useQuery(api.jobs.all, {
    includeCompleted: options?.includeCompleted,
    includeDeleted: options?.includeDeleted,
  });

  return jobs;
};
