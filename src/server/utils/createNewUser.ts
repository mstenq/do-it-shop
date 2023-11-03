import { type TRPCContext } from "@/server/api/trpc";
import { insertUserSchema, tenantAccess, users } from "../db/tenant-schema";
import { z } from "zod";
import { isLocalFile } from "./isLocalFile";
import { createTursoToken } from "../api/routers/turso";
import { encrypt, hashPassword } from "./cypto";
import { TRPCError } from "@trpc/server";

export const createUserSchema = z.object({
  tenantId: z.number(),
  user: insertUserSchema,
  password: z.string(),
});

type Props = {
  ctx: TRPCContext;
  input: z.infer<typeof createUserSchema>;
};

export const createNewUserMutation = async ({ ctx, input }: Props) => {
  // get authToken
  const authToken = isLocalFile ? "" : await createTursoToken(input.tenantId);

  const passwordHash = hashPassword(input.password, input.tenantId);
  const [newUser] = await ctx.tenantDb
    .insert(users)
    .values({ ...input.user, passwordHash, salt: `${input.tenantId}` })
    .returning({ id: users.id });

  if (!newUser) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      cause: "Could not create user record",
    });
  }

  // Create tenantAccess record to store token
  const { encrypted: accessTokenHash, iv } = encrypt(authToken, newUser.id);
  await ctx.tenantDb.insert(tenantAccess).values({
    userId: newUser.id,
    tenantId: input.tenantId,
    iv,
    accessTokenHash,
  });

  return { newUser, authToken };
};
