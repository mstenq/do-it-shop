import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { Triggers } from "convex-helpers/server/triggers";
import { DataModel } from "./_generated/dataModel";
import {
  mutation as rawMutation,
  internalMutation as rawInternalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { calculateTotalTime } from "./timeUtils";

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

triggers.register("customers", async (ctx, change) => {
  console.log("Customer trigger", change);
  if (change.newDoc) {
    /**
     * SYNC STATES VALUE LIST
     */
    const state = change.newDoc.address?.state?.trim();

    if (state) {
      // see if state already exists
      const existingState = await ctx.db
        .query("valueLists")
        .withIndex("by_group_value", (q) =>
          q.eq("group", "states").eq("value", state)
        )
        .first();
      if (!existingState) {
        // create new state if it doesn't exist
        await ctx.db.insert("valueLists", {
          group: "states",
          value: state,
        });
      }
    }

    /**
     * SYNC CITIES VALUE LIST
     */

    const city = change.newDoc.address?.city?.trim();
    if (city) {
      // see if city already exists
      const existingCity = await ctx.db
        .query("valueLists")
        .withIndex("by_group_value", (q) =>
          q.eq("group", "cities").eq("value", city)
        )
        .first();
      if (!existingCity) {
        // create new city if it doesn't exist
        await ctx.db.insert("valueLists", {
          group: "cities",
          value: city,
        });
      }
    }

    /**
     * HANDLE SEARCH INDEX
     */
    // Build search index from relevant fields
    const searchParts = [
      change.newDoc.name,
      change.newDoc.address?.street,
    ].filter(Boolean);

    const searchIndex = searchParts.join(" ");

    // Update denormalized field. Check first to avoid recursion
    if (change.newDoc.searchIndex !== searchIndex) {
      await ctx.db.patch(change.id, { searchIndex });
    }
  }
});

triggers.register("jobs", async (ctx, change) => {
  console.log("Jobs trigger", change);
  if (change.newDoc) {
    if (change.newDoc.stage === "completed" && !change.newDoc.isCompleted) {
      await ctx.db.patch(change.id, { isCompleted: true });
    }

    /**
     * Handle seach index
     */
    // Build search index from relevant fields
    const searchParts = [change.newDoc.description].filter(Boolean);

    const searchIndex = searchParts.join(" ");

    // Update denormalized field. Check first to avoid recursion
    if (change.newDoc.searchIndex !== searchIndex) {
      await ctx.db.patch(change.id, { searchIndex });
    }
  }
});

triggers.register("times", async (ctx, change) => {
  console.log("times trigger", change);

  // if your deleting a doc that already had an endTime, we need to recalculate the employee hours
  if (change.operation === "delete" && change.oldDoc.endTime) {
    ctx.scheduler.runAfter(0, internal.employees.calculateHours, {
      id: change.oldDoc.employeeId,
    });
    return;
  }

  if (change.newDoc && change.newDoc.startTime && change.newDoc.endTime) {
    // Only calculate totalTime if both startTime and endTime are present
    const { startTime, endTime } = change.newDoc;

    // Calculate total time using utility function
    const totalTime = calculateTotalTime(startTime, endTime);
    console.log("Calculated totalTime:", totalTime);

    if (change.newDoc.totalTime !== totalTime) {
      // Update the totalTime field if it has changed
      await ctx.db.patch(change.id, { totalTime });

      // trigger employee hour calculations
      ctx.scheduler.runAfter(1000, internal.employees.calculateHours, {
        id: change.newDoc.employeeId,
      });
    }
  }
});

export const triggerMutation = customMutation(
  rawMutation,
  customCtx(triggers.wrapDB)
);

export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB)
);
