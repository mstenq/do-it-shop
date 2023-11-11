import { type Session, sessionSchema } from "@/schemas/sessionSchema";
import { getTenantDB } from "@/server/db/tenant-db";
import { users } from "@/server/db/tenant-schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

const getUser = async (userId: number) => {
  const tenantDB = getTenantDB();
  const user = await tenantDB.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
    with: {
      tenantAccess: {
        columns: {
          id: true,
          tenantId: true,
          iv: true,
          accessTokenHash: true,
        },
        with: {
          tenant: {
            columns: {
              dbUrl: true,
            },
          },
        },
      },
    },
  });
  return user;
};

export const createUserSession = async (
  userId: number,
  currentTenantId: number | undefined,
) => {
  const user = await getUser(userId);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found while creating session",
    });
  }

  //Use designated tenantId, or first tenantId if none is provided
  const tenantId = currentTenantId ?? user.tenantAccess[0]?.tenantId;
  if (!tenantId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "tenantId not found while creating session",
    });
  }

  // Create user session
  const session: Session = {
    user,
    currentTenantId: tenantId,
  };

  cookies().set("session", JSON.stringify(session), {
    httpOnly: true,
    secure: true,
  });
};

export const getUserSession = (): Session | null => {
  const session = cookies().get("session")?.value;
  if (!session) {
    return null;
  }

  const parsedSession = sessionSchema.safeParse(JSON.parse(session));
  if (!parsedSession.success) {
    return null;
  }

  return parsedSession.data;
};
