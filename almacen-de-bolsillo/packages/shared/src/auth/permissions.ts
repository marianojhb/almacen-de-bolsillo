import type { Role } from "../users/user.types.js";

export type Resource =
  | "sales"
  | "products"
  | "suppliers"
  | "purchases"
  | "employees"
  | "workShifts"
  | "workShiftTypes";

export type Action =
  | "create"
  | "read"
  | "update"
  | "delete";

type Permissions = Partial<Record<Role, Partial<Record<Resource, readonly Action[]>>>>;

export const permissions: Permissions = {
  ADMIN: {
    sales: ["create", "read", "update", "delete"],
    products: ["create", "read", "update", "delete"],
    suppliers: ["create", "read", "update", "delete"],
    purchases: ["create", "read", "update", "delete"],
    employees: ["create", "read", "update", "delete"],
    workShifts: ["create", "read", "update", "delete"],
    workShiftTypes: ["create", "read", "update", "delete"],
  },

  BUSINESS_OWNER: {
    sales: ["create", "read", "update", "delete"],
    products: ["create", "read", "update", "delete"],
    suppliers: ["create", "read", "update", "delete"],
    purchases: ["create", "read", "update", "delete"],
    employees: ["create", "read", "update", "delete"],
    workShifts: ["create", "read", "update", "delete"],
    workShiftTypes: ["create", "read", "update", "delete"],
  },

  SUPERVISOR: {
    sales: ["create", "read", "update"],
    products: ["create", "read", "update"],
    suppliers: ["create", "read", "update"],
    purchases: ["create", "read", "update"],
    employees: ["read"],
    workShifts: ["create", "read", "update", "delete"],
    workShiftTypes: ["create", "read", "update", "delete"],
  },

  EMPLOYEE: {
    sales: ["create", "read"],
    products: ["create", "read", "update"],
    workShifts: ["read"],
  },
};

export function hasPermission(role: Role, resource: Resource,action: Action): boolean {
  return permissions[role]?.[resource]?.includes(action) ?? false;
}