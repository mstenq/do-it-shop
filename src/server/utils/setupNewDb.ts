import { DB } from "../db/db";
import { permissions, roles } from "../db/schema";
import { roleSeed } from "../db/seed/permissionsSeed";
export const setupNewDb = async (db: DB, userId: number) => {
  for (const role of roleSeed) {
    const newRole = await db
      .insert(roles)
      .values({
        role: role.role,
        description: role.description,
      })
      .returning({ id: roles.id });
    if (!newRole || !newRole[0] || !newRole[0].id) {
      throw new Error("Could not create role");
    }
    const permissionsToInsert = role.permissions.map((p) => ({
      ...p,
      roleId: newRole[0]!.id,
    }));
    await db.insert(permissions).values(permissionsToInsert);
  }
};
