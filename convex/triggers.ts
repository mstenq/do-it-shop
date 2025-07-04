import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { Triggers } from "convex-helpers/server/triggers";
import { DataModel } from "./_generated/dataModel";
import { mutation as rawMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Triggers
 */
const triggers = new Triggers<DataModel>();

triggers.register("employees", async (ctx, change) => {
  console.log("Employee trigger", change);
  if (change.newDoc) {
    // Build search index from relevant fields
    const searchParts = [
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
    const searchParts = [change.newDoc.name].filter(Boolean);

    const searchIndex = searchParts.join(" ");

    // Update denormalized field. Check first to avoid recursion
    if (change.newDoc.searchIndex !== searchIndex) {
      await ctx.db.patch(change.id, { searchIndex });
    }
  }
});

triggers.register("times", async (ctx, change) => {
  console.log("times trigger", change);
  if (
    change.newDoc &&
    change.newDoc.date &&
    change.newDoc.startTime &&
    change.newDoc.endTime
  ) {
    // Only calculate totalTime if both startTime and endTime are present
    const { startTime, endTime, date } = change.newDoc;
    let totalTime: number = 0;

    // Parse time strings (e.g., "14:08") and combine with timestamp date
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // Create Date objects using the timestamp date and parsed times
    const start = new Date(date);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(date);
    end.setHours(endHour, endMinute, 0, 0);

    // Handle case where end time is next day (e.g., shift crosses midnight)
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    totalTime = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
    console.log("Calculated totalTime:", totalTime);

    if (change.newDoc.totalTime !== totalTime) {
      // Update the totalTime field if it has changed
      await ctx.db.patch(change.id, { totalTime });

      // trigger employee hour calculations
      ctx.scheduler.runAfter(0, internal.employees.calculateHours, {
        id: change.newDoc.employeeId,
      });
    }
  }
});

export const triggerMutation = customMutation(
  rawMutation,
  customCtx(triggers.wrapDB)
);
