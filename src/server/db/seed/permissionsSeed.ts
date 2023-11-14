import { PermissionsInsert, RoleInsert } from "../schema";

type PermissionSeed = RoleInsert & {
  permissions: Omit<PermissionsInsert, "roleId">[];
};

export const roleSeed = [
  {
    role: "owner",
    description: "Has unrestricted access within organization.",
    permissions: [
      {
        table: "projects",
        view: true,
        edit: true,
        delete: true,
        editOthers: true,
        deleteOthers: true,
      },
      {
        table: "clients",
        view: true,
        edit: true,
        delete: true,
        editOthers: true,
        deleteOthers: true,
      },
      {
        table: "roles",
        view: true,
        edit: true,
        delete: true,
        editOthers: true,
        deleteOthers: true,
      },
      {
        table: "permissions",
        view: true,
        edit: true,
        delete: true,
        editOthers: true,
        deleteOthers: true,
      },
    ],
  },
  {
    role: "admin",
    description:
      "An admin has unrestricted access to modify data within the system system, and limited abilities to edit organization settings.",
    permissions: [
      {
        table: "projects",
        view: true,
        edit: true,
        delete: true,
        editOthers: true,
        deleteOthers: true,
      },
      {
        table: "clients",
        view: true,
        edit: true,
        delete: true,
        editOthers: true,
        deleteOthers: true,
      },
      {
        table: "roles",
        view: true,
        edit: true,
        delete: true,
        editOthers: true,
        deleteOthers: true,
      },
      {
        table: "permissions",
        view: true,
        edit: true,
        delete: true,
        editOthers: true,
        deleteOthers: true,
      },
    ],
  },
  {
    role: "power-user",
    description:
      "Has unrestricted access to modify data within the system, but no access to any organization settings.",
    permissions: [
      {
        table: "projects",
        view: true,
        edit: true,
        delete: true,
        editOthers: true,
        deleteOthers: true,
      },
      {
        table: "clients",
        view: true,
        edit: true,
        delete: true,
        editOthers: true,
        deleteOthers: true,
      },
      {
        table: "roles",
        view: false,
        edit: false,
        delete: false,
        editOthers: false,
        deleteOthers: false,
      },
      {
        table: "permissions",
        view: false,
        edit: false,
        delete: false,
        editOthers: false,
        deleteOthers: false,
      },
    ],
  },
  {
    role: "user",
    description:
      "Has unrestricted access to modify data they created within the system. They cannot edit other peoples data.",
    permissions: [
      {
        table: "projects",
        view: true,
        edit: true,
        delete: true,
        editOthers: false,
        deleteOthers: false,
      },
      {
        table: "clients",
        view: true,
        edit: true,
        delete: true,
        editOthers: false,
        deleteOthers: false,
      },
      {
        table: "roles",
        view: false,
        edit: false,
        delete: false,
        editOthers: false,
        deleteOthers: false,
      },
      {
        table: "permissions",
        view: false,
        edit: false,
        delete: false,
        editOthers: false,
        deleteOthers: false,
      },
    ],
  },
  {
    role: "limited user",
    description: "Has the ability to create/edit data, but cannot delete.",
    permissions: [
      {
        table: "projects",
        view: true,
        edit: true,
        delete: true,
        editOthers: true,
        deleteOthers: true,
      },
      {
        table: "clients",
        view: true,
        edit: true,
        delete: true,
        editOthers: true,
        deleteOthers: true,
      },
      {
        table: "roles",
        view: false,
        edit: false,
        delete: false,
        editOthers: false,
        deleteOthers: false,
      },
      {
        table: "permissions",
        view: false,
        edit: false,
        delete: false,
        editOthers: false,
        deleteOthers: false,
      },
    ],
  },
  {
    role: "read-only",
    description: "Can only view data, without any ability to modify anything.",
    permissions: [
      {
        table: "projects",
        view: true,
        edit: false,
        delete: false,
        editOthers: false,
        deleteOthers: false,
      },
      {
        table: "clients",
        view: true,
        edit: false,
        delete: false,
        editOthers: false,
        deleteOthers: false,
      },
      {
        table: "roles",
        view: false,
        edit: false,
        delete: false,
        editOthers: false,
        deleteOthers: false,
      },
      {
        table: "permissions",
        view: false,
        edit: false,
        delete: false,
        editOthers: false,
        deleteOthers: false,
      },
    ],
  },
] satisfies PermissionSeed[];
