import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { Triggers } from "convex-helpers/server/triggers";
import { DataModel } from "./_generated/dataModel";
import { mutation as rawMutation } from "./_generated/server";

/**
 * Triggers
 */
const triggers = new Triggers<DataModel>();

triggers.register("employees", async (ctx, change) => {
  console.log("Employee trigger", change);
  if (change.newDoc) {
    // Build search index from relevant fields
    const searchParts = [
      change.newDoc.id,
      change.newDoc.nameFirst,
      change.newDoc.nameLast,
      change.newDoc.email,
    ].filter(Boolean);

    const searchIndex = searchParts.join(" ");

    // Update denormalized field. Check first to avoid recursion
    if (change.newDoc.searchIndex !== searchIndex) {
      await ctx.db.patch(change.id, { searchIndex });
    }
  }
});

triggers.register("paySchedule", async (ctx, change) => {
  console.log("PaySchedule trigger", change);
  if (change.newDoc) {
    // Build search index from relevant fields
    const searchParts = [change.newDoc.id, change.newDoc.name].filter(Boolean);

    const searchIndex = searchParts.join(" ");

    // Update denormalized field. Check first to avoid recursion
    if (change.newDoc.searchIndex !== searchIndex) {
      await ctx.db.patch(change.id, { searchIndex });
    }
  }
});

triggers.register("times", async (ctx, change) => {
  console.log("times trigger", change);
  if (change.newDoc) {
    // Only calculate totalTime if both startTime and endTime are present
    const { startTime, endTime } = change.newDoc;
    let totalTime: number | undefined = undefined;
    if (startTime && endTime) {
      // Assume startTime and endTime are ISO strings (e.g., '2025-07-03T09:00:00')
      const start = new Date(`${change.newDoc.date}T${startTime}`);
      const end = new Date(`${change.newDoc.date}T${endTime}`);
      totalTime = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
      if (totalTime < 0) totalTime = undefined; // don't allow negative
    }
    if (change.newDoc.totalTime !== totalTime) {
      await ctx.db.patch(change.id, { totalTime });
    }
  }
});

export const triggerMutation = customMutation(
  rawMutation,
  customCtx(triggers.wrapDB)
);
