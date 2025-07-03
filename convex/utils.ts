import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { query } from "./_generated/server";
import { triggerMutation } from "./triggers";
import { Id } from "./_generated/dataModel";

const userSchema = z.object({
  subject: z.string(), //this is the id
});

export function parseDate(dateStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  // Check for invalid date (e.g., 2024-02-30)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export const authQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const parsedIdentity = userSchema.parse(identity);
    const user = { ...parsedIdentity, id: parsedIdentity.subject };

    return { user };
  })
);

export const authMutation = customMutation(
  triggerMutation,
  customCtx(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const parsedIdentity = userSchema.parse(identity);
    const user = { ...parsedIdentity, id: parsedIdentity.subject };

    return { user };
  })
);

export const NullP = Promise.resolve(null);

export async function joinData<
  T extends { _id: Id<any> },
  J extends Record<string, any>,
>(
  data: T[],
  joinFunctions: {
    [K in keyof J]: (record: T) => Promise<J[K]>;
  }
): Promise<Array<T & J>> {
  if (!data) return data;

  const joinKeys = Object.keys(joinFunctions) as Array<keyof J>;

  // For each join function, collect unique results to avoid duplicate calls
  const joinResults: Record<string, Map<string, any>> = {};

  for (const joinKey of joinKeys) {
    const joinFunction = joinFunctions[joinKey];
    const resultMap = new Map<string, any>();
    const callCache = new Map<string, Promise<any>>();

    // Process each record and cache the promises to avoid duplicate calls
    for (const record of data) {
      try {
        // Create a unique key for this function call based on the record's relevant fields
        // We'll use JSON.stringify of the record as a simple cache key
        const cacheKey = record._id;

        let resultPromise = callCache.get(cacheKey);
        if (!resultPromise) {
          resultPromise = joinFunction(record);
          callCache.set(cacheKey, resultPromise);
        }

        const result = await resultPromise;
        resultMap.set(cacheKey, result);
      } catch (error) {
        // If the join function fails, set the result to null
        const cacheKey = JSON.stringify(record);
        resultMap.set(cacheKey, null);
      }
    }

    joinResults[joinKey as string] = resultMap;
  }

  // Apply joins to each record
  const joinedRecords = data.map((record) => {
    const joined: any = { ...record };
    const recordKey = record._id;

    joinKeys.forEach((joinKey) => {
      const resultMap = joinResults[joinKey as string];
      joined[joinKey] = resultMap.get(recordKey) || null;
    });

    return joined;
  });

  return joinedRecords;
}

export const formatDate = (date: Date | string | undefined | null): string => {
  if (!date) {
    return "";
  }
  if (typeof date === "string") {
    date = new Date(date);
    if (isNaN(date.getTime())) {
      return "";
    }
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (date: Date | string | undefined | null): string => {
  if (!date) {
    return "";
  }
  if (typeof date === "string") {
    date = new Date(date);
    if (isNaN(date.getTime())) {
      return "--:--";
    }
  }
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};
