import { Route } from "@/routes/pay-roll.index";
import { api } from "@convex/api";
import { useQuery } from "convex-helpers/react/cache";
import { useMemo } from "react";

export function usePayScheduleData() {
  const search = Route.useSearch();

  const data = useQuery(api.paySchedule.all);

  const filteredData = useMemo(() => {
    if (!data) return data;

    let filtered = data;

    // Apply global search filter
    if (search.q) {
      const query = search.q.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.name?.toLowerCase().includes(query) ||
          item.year?.toString().includes(query) ||
          item.payPeriod?.toString().includes(query)
        );
      });
    }

    return filtered;
  }, [data, search.q]);

  return filteredData;
}
