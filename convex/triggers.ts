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
    ctx.runMutation(internal.valueList.upsert, {
      group: "states",
      value: change.newDoc.address?.state,
    });

    ctx.runMutation(internal.valueList.upsert, {
      group: "cities",
      value: change.newDoc.address?.city,
    });

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
    /**
     * SYNC STATES VALUE LIST
     */
    ctx.runMutation(internal.valueList.upsert, {
      group: "jobDescriptions",
      value: change.newDoc.description,
    });

    /**
     * Handle isCompleted flag
     */
    if (change.newDoc.status === "completed" && !change.newDoc.isCompleted) {
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
      ctx.scheduler.runAfter(500, internal.employees.calculateHours, {
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
