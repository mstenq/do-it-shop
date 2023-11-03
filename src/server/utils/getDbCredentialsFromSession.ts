import { decrypt } from "./cypto";
import { type Session } from "@/schemas/sessionSchema";

type Return = {
  url: string;
  authToken: string;
} | null;

export const getDbCredentialsFromSession = (
  session: Session | null,
): Return => {
  if (!session) return null;

  // Get current tenantIDs access info
  const tenantId = session?.currentTenantId;
  const tenantAccess = session?.user.tenantAccess.find(
    (a) => a.tenantId === tenantId,
  );
  const url = tenantAccess?.tenant?.dbUrl;

  // Confirm we have everything we need to decrypt the auth token
  if (!session?.user || !tenantAccess || !url) {
    return null;
  }

  // Decrypt the auth token
  const authToken = decrypt(
    tenantAccess?.accessTokenHash,
    session.user.id,
    tenantAccess.iv,
  );

  return { url, authToken };
};
