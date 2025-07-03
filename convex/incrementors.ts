import { Infer } from "convex/values";
import { internalMutation } from "./_generated/server";
import { tableName } from "./schema";

const tablePrefixes: Record<Infer<typeof tableName>, string> = {
  employees: "EMP",
  paySchedule: "PSC",
};

export const getNextId = internalMutation({
  args: { tableName: tableName },
  handler: async (ctx, args) => {
    const incrementor = await ctx.db
      .query("incrementors")
      .withIndex("by_tableName", (q) => q.eq("tableName", args.tableName))
      .first();
    const prefix = tablePrefixes[args.tableName];
    const nextAvailableId = incrementor?.nextAvailableId ?? 1000;

    // Update or add the incrementor
    if (incrementor) {
      await ctx.db.patch(incrementor._id, {
        nextAvailableId: nextAvailableId + 1,
      });
    } else {
      await ctx.db.insert("incrementors", {
        tableName: args.tableName,
        nextAvailableId: nextAvailableId + 1,
      });
    }

    return `${prefix}${nextAvailableId}`;
  },
});
