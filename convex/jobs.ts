import { v } from "convex/values";
import { internal } from "./_generated/api";
import { authMutation, authQuery, joinData, NullP } from "./utils";
import { Id } from "./_generated/dataModel";
import { jobStage, jobStatus } from "./schema";
import { getOrCreateCustomer } from "./customers";

/**
 * Queries
 */
export const all = authQuery({
  args: {
    includeCompleted: v.optional(v.boolean()),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const records = args.includeCompleted
      ? await ctx.db.query("jobs").collect()
      : await ctx.db
          .query("jobs")
          .withIndex("by_isCompleted", (q) => q.eq("isCompleted", false))
          .collect();

    // Filter out deleted records unless explicitly requested
    const filteredRecords = !args.includeDeleted
      ? records.filter((record) => !record.isDeleted)
      : records;

    // Join related data
    const joinedRecords = await joinData(filteredRecords, {
      customer: (r) => (r.customerId ? ctx.db.get(r.customerId) : NullP),
      employee: (r) => (r.employeeId ? ctx.db.get(r.employeeId) : NullP),
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
    const record = await ctx.db.get(args.id as Id<"jobs">);

    if (!record) {
      return null;
    }

    // Join related data
    const [joinedRecord] = await joinData([record], {
      customer: (r) => (r.customerId ? ctx.db.get(r.customerId) : NullP),
      employee: (r) => (r.employeeId ? ctx.db.get(r.employeeId) : NullP),
    });

    return joinedRecord;
  },
});

const commonArgs = {
  customerName: v.optional(v.string()),
  description: v.optional(v.string()),
  notes: v.optional(v.string()),
  employeeId: v.optional(v.id("employees")),
  dueDate: v.optional(v.number()),
  status: v.optional(jobStatus),
  stage: v.optional(jobStage),
  quantity: v.optional(v.string()),
};

/**
 * Mutations
 */
export const add = authMutation({
  args: {
    ...commonArgs,
    customerName: v.string(), // Required
    description: v.string(), // Required
    status: jobStatus, // Required
    stage: jobStage, // Required
  },
  handler: async (ctx, args) => {
    const { customerName, ...jobData } = args;
    const customerId = await getOrCreateCustomer(ctx, customerName);

    return ctx.db.insert("jobs", {
      ...jobData,
      customerId,
      isDeleted: false,
      isCompleted: args.stage === "completed",
    });
  },
});

export const update = authMutation({
  args: {
    ...commonArgs,
    id: v.id("jobs"), // Required ID for updates
    customerId: v.optional(v.id("customers")),
  },
  handler: async (ctx, args) => {
    const { id, customerName, ...updateData } = args;
    await ctx.db.patch(id, {
      ...updateData,
      ...(customerName
        ? { customerId: await getOrCreateCustomer(ctx, customerName) }
        : {}),
    });
    return;
  },
});

export const destroy = authMutation({
  args: { ids: v.array(v.id("jobs")) },
  handler: async (ctx, args) => {
    for (const _id of args.ids) {
      await ctx.db.patch(_id, { isDeleted: true });
    }
    return args.ids;
  },
});

export const restore = authMutation({
  args: { ids: v.array(v.id("jobs")) },
  handler: async (ctx, args) => {
    for (const _id of args.ids) {
      await ctx.db.patch(_id, { isDeleted: false });
    }
    return args.ids;
  },
});
