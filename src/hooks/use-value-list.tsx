import { api } from "@convex/api";
import { useQuery } from "convex-helpers/react/cache";

type Args = (typeof api.valueList.all)["_args"];

export const useValueList = (args: Args) => {
  return useQuery(api.valueList.all, args) ?? [];
};
