import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import {
  timesDateRangeQuery,
  timesEmployeeAndDateRangeQuery,
} from "./timeUtils";
import { authMutation, authQuery, joinData, NullP } from "./utils";
import { groups } from "./schema";

/**
 * Re-export query functions for backward compatibility
 */
export { timesDateRangeQuery, timesEmployeeAndDateRangeQuery };

/**
 * Queries
 */

export const all = authQuery({
  args: {
    group: groups,
  },
  handler: async (ctx, args) => {
    console.log("Fetching all value lists with args:", args);
    const results = await ctx.db
      .query("valueLists")
      .withIndex("by_group_value", (q) => q.eq("group", args.group))
      .order("asc")
      .collect();

    return results;
  },
});
