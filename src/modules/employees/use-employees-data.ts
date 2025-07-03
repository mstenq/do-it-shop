import { api } from "@convex/api";
import { useQuery } from "convex-helpers/react/cache";
import { ConvexType } from "@/utils/convexType";
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

    // Filter by department
    if (filters?.department) {
      data = data.filter(
        (employee) => employee.department === filters?.department
      );
    }

    // Filter by level
    if (filters?.level) {
      data = data.filter((employee) => employee.level === filters?.level);
    }

    // Filter by grade
    if (filters?.grade) {
      data = data.filter((employee) => employee.grade === filters?.grade);
    }

    return data;
  };

  return filteredData();
};
