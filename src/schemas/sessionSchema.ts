import { z } from "zod";

export const sessionSchema = z.object({
  user: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    tenantAccess: z.array(
      z.object({
        id: z.number(),
        tenantId: z.number().nullable(),
        iv: z.string(),
        accessTokenHash: z.string(),
        tenant: z
          .object({
            dbUrl: z.string().nullable(),
          })
          .nullable(),
      }),
    ),
  }),
  currentTenantId: z.number(),
});

export type Session = z.infer<typeof sessionSchema>;
