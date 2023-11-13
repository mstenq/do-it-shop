import { Session } from "@/schemas/sessionSchema";
import { Permission } from "../db/schema";
import { getSessionsAndDb } from "./getSessionAndDb";

type AvailableActions = Exclude<
  keyof Permission,
  | "id"
  | "roleId"
  | "table"
  | "createdAt"
  | "updatedAt"
  | "additionalPermissions"
>;

export const isAuthorized = async (table: string, action: AvailableActions) => {
  const { session, db } = getSessionsAndDb();
  if (!session || !db) return false;

  // get permission record based on current users role and table
  const role = session.currentTenantId;

  return true;
};
