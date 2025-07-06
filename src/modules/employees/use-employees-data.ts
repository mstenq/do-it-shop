import { api } from "@convex/api";
import { useQuery } from "convex-helpers/react/cache";
import { ConvexType } from "@/utils/convex-type";
import { useSearch } from "@tanstack/react-router";

export const useEmployeesData = (
  options: {
    includeDeleted?: boolean;
  } = {}
) => {
  const employees = useQuery(api.employees.all, {
    includeDeleted: options?.includeDeleted,
  });

  const filters = useSearch({
    from: "/employees/",
  }).filters;

  const filteredData = (): ConvexType<"employees.all"> => {
    let data = employees ?? [];

    return data;
  };

  return filteredData();
};
