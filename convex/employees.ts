import { v } from "convex/values";
import { internal } from "./_generated/api";
import { authMutation, authQuery, joinData, NullP } from "./utils";
import { Id } from "./_generated/dataModel";

/**
 * Queries
 */

export const all = authQuery({
  args: { includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const employees = await ctx.db.query("employees").collect();

    // Filter out deleted employees unless explicitly requested
    const filteredEmployees = !args.includeDeleted
      ? employees.filter((employee) => !employee.isDeleted)
      : employees;

    // Join related data
    const joinedEmployees = await joinData(filteredEmployees, {
      photo: (record) =>
        record.photoStorageId
          ? ctx.storage.getUrl(record.photoStorageId)
          : NullP,
    });

    return joinedEmployees;
  },
});

export const get = authQuery({
  args: { _id: v.string() },
  handler: async (ctx, args) => {
    if (!args._id) {
      return null;
    }
    const employee = await ctx.db.get(args._id as Id<"employees">);

    if (!employee) {
      return null;
    }

    // Join related data
    const [joinedEmployee] = await joinData([employee], {
      photo: (record) =>
        record.photoStorageId
          ? ctx.storage.getUrl(record.photoStorageId)
          : NullP,
    });

    return joinedEmployee;
  },
});

const commonArgs = {
  nameFirst: v.optional(v.string()),
  nameLast: v.optional(v.string()),
  photoStorageId: v.optional(v.id("_storage")),
  phoneNumber: v.optional(v.string()),
  email: v.optional(v.string()),
};

/**
 * Mutations
 */
export const add = authMutation({
  args: {
    ...commonArgs,
    nameFirst: v.string(), // Required field
    nameLast: v.string(), // Required field
  },
  handler: async (ctx, args) => {
    const nextAvailableId: string = await ctx.runMutation(
      internal.incrementors.getNextId,
      {
        tableName: "employees",
      }
    );

    await ctx.db.insert("employees", {
      ...args,
      id: nextAvailableId,
      isDeleted: false,
    });

    return nextAvailableId;
  },
});

export const update = authMutation({
  args: {
    _id: v.id("employees"),
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
  args: { ids: v.array(v.id("employees")) },
  handler: async (ctx, args) => {
    for (const _id of args.ids) {
      await ctx.db.patch(_id, { isDeleted: true });
    }
    return args.ids;
  },
});

export const restore = authMutation({
  args: { ids: v.array(v.id("employees")) },
  handler: async (ctx, args) => {
    for (const _id of args.ids) {
      await ctx.db.patch(_id, { isDeleted: false });
    }
    return args.ids;
  },
});
