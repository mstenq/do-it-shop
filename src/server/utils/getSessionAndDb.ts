import { DB, getDB } from "../db/db";
import { getDbCredentialsFromSession } from "./getDbCredentialsFromSession";
import { getUserSession } from "./userSession";

export const getSessionsAndDb = () => {
  const session = getUserSession();

  // Configure users database client
  const dbCredentials = getDbCredentialsFromSession(session);
  let db: DB | null = null;
  if (dbCredentials) {
    const { url, authToken } = dbCredentials;
    db = getDB({ url, authToken });
  }

  return { session, db };
};
