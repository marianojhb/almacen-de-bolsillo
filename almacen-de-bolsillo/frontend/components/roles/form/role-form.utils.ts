import { normalizePermissions } from "@almacen/shared";
import type { CommerceRoleDto, CreateCommerceRoleDto, PermissionDto } from "@almacen/shared";

export const permissionGroupNames: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Productos",
  categories: "Categorías",
  suppliers: "Proveedores",
  employees: "Empleados",
  sales: "Ventas",
  purchases: "Compras",
  balances: "Balances",
  transactions: "Dinero y balances",
  stock_movements: "Movimientos de stock",
  users: "Usuarios",
  roles: "Roles y permisos",
  commerce: "Comercio",
};

export type RoleFormState = {
  name: string;
  description: string;
  permissions: string[];
};

export const createRoleFormState = (role?: CommerceRoleDto): RoleFormState => ({
  name: role?.name ?? "",
  description: role?.description ?? "",
  permissions: normalizePermissions(role?.permissions.map((item) => item.permission.code) ?? []),
});

type ValidationResult =
  | { ok: true; data: CreateCommerceRoleDto }
  | { ok: false; message: string };

export function validateRoleForm(values: RoleFormState, catalog: PermissionDto[]): ValidationResult {
  const name = values.name.trim();
  if (!name || name.length > 100) return { ok: false, message: "El nombre debe tener entre 1 y 100 caracteres." };
  if (values.description.trim().length > 1000) return { ok: false, message: "La descripción admite hasta 1000 caracteres." };
  const permissions = normalizePermissions(values.permissions);
  if (permissions.length > 200 || permissions.some((code) => !catalog.some((permission) => permission.code === code))) {
    return { ok: false, message: "Uno o más permisos no están disponibles. Actualizá el catálogo." };
  }
  return { ok: true, data: { name, description: values.description.trim() || null, permissions } };
}
