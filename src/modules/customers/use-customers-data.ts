import { api } from "@convex/api";
import { useQuery } from "convex-helpers/react/cache";

export const useCustomersData = (
  options: {
    includeDeleted?: boolean;
  } = {}
) => {
  const customers = useQuery(api.customers.all, {
    includeDeleted: options?.includeDeleted,
  });

  return customers;
};
