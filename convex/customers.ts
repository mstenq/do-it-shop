import { v } from "convex/values";
import { internal } from "./_generated/api";
import { authMutation, authQuery, joinData, NullP } from "./utils";
import { Id } from "./_generated/dataModel";
import { address } from "./schema";
import { MutationCtx } from "./_generated/server";

/**
 * Queries
 */
export const all = authQuery({
  args: { includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const records = await ctx.db.query("customers").collect();

    // Filter out deleted records unless explicitly requested
    const filteredRecords = !args.includeDeleted
      ? records.filter((record) => !record.isDeleted)
      : records;

    // Join related data if needed
    const joinedRecords = await joinData(filteredRecords, {
      // No joins needed for now
    });

    return joinedRecords;
  },
});

export const get = authQuery({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    if (!args.id) {
      return null;
    }
    const record = await ctx.db.get(args.id as Id<"customers">);

    if (!record) {
      return null;
    }

    // Join related data if needed
    const [joinedRecord] = await joinData([record], {
      // No joins needed for now
    });

    return joinedRecord;
  },
});

const commonArgs = {
  name: v.optional(v.string()),
  address: v.optional(address),
  website: v.optional(v.string()),
  notes: v.optional(v.string()),
};

/**
 * Mutations
 */
export const add = authMutation({
  args: {
    ...commonArgs,
    name: v.string(), // Make required fields non-optional
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("customers", {
      ...args,
      isDeleted: false,
    });
  },
});

export const update = authMutation({
  args: {
    ...commonArgs,
    id: v.id("customers"), // Required ID for updates
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, {
      ...rest,
    });
    return;
  },
});

export const destroy = authMutation({
  args: { ids: v.array(v.id("customers")) },
  handler: async (ctx, args) => {
    for (const _id of args.ids) {
      await ctx.db.patch(_id, { isDeleted: true });
    }
    return args.ids;
  },
});

export const restore = authMutation({
  args: { ids: v.array(v.id("customers")) },
  handler: async (ctx, args) => {
    for (const _id of args.ids) {
      await ctx.db.patch(_id, { isDeleted: false });
    }
    return args.ids;
  },
});

export const getOrCreateCustomer = async (ctx: MutationCtx, name: string) => {
  // lookup customer by name
  let customerId = await ctx.db
    .query("customers")
    .withIndex("by_name", (q) => q.eq("name", name.trim()))
    .first()
    .then((c) => c?._id);

  // If customer doesn't exist, create a new one
  if (!customerId) {
    customerId = await ctx.db.insert("customers", {
      name: name.trim(),
      isDeleted: false,
    });
  }

  if (!customerId) {
    throw new Error("Failed to create or retrieve customer");
  }

  return customerId;
};
