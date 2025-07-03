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

export const triggerMutation = customMutation(
  rawMutation,
  customCtx(triggers.wrapDB)
);
