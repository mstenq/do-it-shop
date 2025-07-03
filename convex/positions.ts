import { v } from "convex/values";
import { internal } from "./_generated/api";
import { authMutation, authQuery } from "./utils";

/**
 * Queries
 */
export const all = authQuery({
  args: { includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const records = await ctx.db.query("positions").collect();

    // Filter out deleted records unless explicitly requested
    const filteredRecords = !args.includeDeleted
      ? records.filter((record) => !record.isDeleted)
      : records;

    return filteredRecords;
  },
});

export const get = authQuery({
  args: { _id: v.id("positions") },
  handler: async (ctx, args) => {
    const position = await ctx.db.get(args._id);
    return position;
  },
});

const commonArgs = {
  name: v.optional(v.string()),
  schedulerColor: v.optional(v.string()),
};

/**
 * Mutations
 */
export const add = authMutation({
  args: {
    ...commonArgs,
    name: v.string(), // Make required fields non-optional
    schedulerColor: v.string(),
  },
  handler: async (ctx, args) => {
    const nextAvailableId: string = await ctx.runMutation(
      internal.incrementors.getNextId,
      {
        tableName: "positions",
      }
    );

    await ctx.db.insert("positions", {
      ...args,
      id: nextAvailableId,
      isDeleted: false,
    });

    return nextAvailableId;
  },
});

export const update = authMutation({
  args: {
    _id: v.id("positions"),
    ...commonArgs,
  },
  handler: async (ctx, { _id, ...args }) => {
    await ctx.db.patch(_id, {
      ...args,
    });
    return;
  },
});

export const destroy = authMutation({
  args: { ids: v.array(v.id("positions")) },
  handler: async (ctx, args) => {
    for (const _id of args.ids) {
      await ctx.db.patch(_id, { isDeleted: true });
    }
    return args.ids;
  },
});

export const restore = authMutation({
  args: { ids: v.array(v.id("positions")) },
  handler: async (ctx, args) => {
    for (const _id of args.ids) {
      await ctx.db.patch(_id, { isDeleted: false });
    }
    return args.ids;
  },
});
