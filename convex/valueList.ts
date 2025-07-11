import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import {
  timesDateRangeQuery,
  timesEmployeeAndDateRangeQuery,
} from "./timeUtils";
import { authMutation, authQuery, joinData, NullP } from "./utils";
import { groups } from "./schema";
import { internalMutation } from "./triggers";

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

export const upsert = internalMutation({
  args: {
    group: groups,
    value: v.optional(v.string()),
  },
  handler: async (ctx, { group, value }) => {
    if (!value || value.trim() === "") {
      return;
    }
    console.log("Upserting value list item:", value);
    const existing = await ctx.db
      .query("valueLists")
      .withIndex("by_group_value", (q) =>
        q.eq("group", group).eq("value", value.trim())
      )
      .first();

    if (!existing) {
      return ctx.db.insert("valueLists", {
        group,
        value: value.trim(),
      });
    }
  },
});
