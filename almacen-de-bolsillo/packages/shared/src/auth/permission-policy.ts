export type PermissionOption = {
  id: string;
  module: string;
  label: string;
  codes: string[];
  additional?: boolean;
};

export const permissionOptions: PermissionOption[] = [
  {id: "products.read", module: "products", label: "Ver productos", codes: ["products.read"]},
  {id: "products.write", module: "products", label: "Crear o editar productos", codes: ["products.create", "products.update"]},
  {id: "products.delete", module: "products", label: "Dar de baja productos", codes: ["products.delete"]},
  {id: "suppliers.read", module: "suppliers", label: "Ver proveedores", codes: ["suppliers.read"]},
  {id: "suppliers.write", module: "suppliers", label: "Crear o editar proveedores", codes: ["suppliers.create", "suppliers.update"]},
  {id: "suppliers.delete", module: "suppliers", label: "Dar de baja proveedores", codes: ["suppliers.delete"]},
  {id: "employees.read", module: "employees", label: "Ver empleados", codes: ["employees.read"]},
  {id: "employees.write", module: "employees", label: "Crear o editar empleados", codes: ["employees.create", "employees.update"]},
  {id: "employees.delete", module: "employees", label: "Dar de baja empleados", codes: ["employees.deactivate"]},
  {id: "sales.read", module: "sales", label: "Ver ventas", codes: ["sales.read"]},
  {id: "sales.write", module: "sales", label: "Crear o editar ventas", codes: ["sales.create", "sales.update"]},
  {id: "sales.delete", module: "sales", label: "Dar de baja o eliminar ventas", codes: ["sales.delete"]},
  {id: "purchases.read", module: "purchases", label: "Ver compras", codes: ["purchases.read"]},
  {id: "purchases.write", module: "purchases", label: "Crear o editar compras", codes: ["purchases.create", "purchases.update"]},
  {id: "purchases.delete", module: "purchases", label: "Dar de baja o eliminar compras", codes: ["purchases.delete"]},
  { id: "employees.permanent_delete", additional: true, module: "employees", label: "Eliminar empleados definitivamente", codes: ["employees.delete"] },
  { id: "work_shifts.read", module: "employees", label: "Ver turnos laborales de todos los empleados", codes: ["work_shifts.read"] },
  { id: "work_shifts.manage", module: "employees", label: "Gestionar turnos laborales", codes: ["work_shifts.manage"] },
  { id: "categories.write", additional: true, module: "products", label: "Crear o editar categorías", codes: ["categories.create", "categories.update"] },
  { id: "categories.delete", additional: true, module: "products", label: "Eliminar categorías definitivamente", codes: ["categories.delete"] },
  { id: "stock_movements.read", additional: true, module: "products", label: "Ver historial de stock", codes: ["stock_movements.read"] },
  { id: "stock_movements.create", additional: true, module: "products", label: "Ajustar stock", codes: ["stock_movements.create"] },
  { id: "transactions.read", module: "transactions", label: "Ver movimientos de dinero", codes: ["transactions.read"] },
  { id: "transactions.manage", module: "transactions", label: "Gestionar movimientos de dinero", codes: ["transactions.manage"] },
  { id: "balances.read", additional: true, module: "transactions", label: "Ver balances", codes: ["balances.read"] },
  { id: "balances.manage", additional: true, module: "transactions", label: "Gestionar balances", codes: ["balances.manage"] },
  { id: "users.read", module: "users", label: "Ver usuarios", codes: ["users.read"] },
  { id: "users.manage", module: "users", label: "Administrar usuarios y sus accesos", codes: ["users.manage"] },
  { id: "roles.read", module: "roles", label: "Ver roles", codes: ["roles.read"] },
  { id: "roles.manage", module: "roles", label: "Administrar roles y permisos", codes: ["roles.manage"] },
  { id: "dashboard.read", module: "dashboard", label: "Ver dashboard", codes: ["dashboard.read"] },
  { id: "commerce.update", additional: true, module: "commerce", label: "Editar datos del comercio", codes: ["commerce.update"] },
];

// Dependencias de consulta, no permisos de escritura adicionales.
export function getPermissionDependencies(code: string): string[] {
  const [module, action] = code.split(".");
  const dependencies: string[] = [];
  if (["create", "update", "delete", "deactivate", "manage"].includes(action ?? "") && module !== "commerce") {
    dependencies.push(module + ".read");
  }
  if (module === "products") dependencies.push("categories.read");
  if (module === "categories" && action !== "read") dependencies.push("products.read");
  if ((module === "sales" || module === "purchases") && (action === "create" || action === "update")) dependencies.push("products.read");
  if (module === "suppliers" && (action === "create" || action === "update")) dependencies.push("products.read");
  if (module === "stock_movements") dependencies.push("products.read");
  if (code === "users.manage") dependencies.push("roles.read");
  return dependencies;
}

export function normalizePermissions(codes: readonly string[]): string[] {
  const result = new Set(codes);
  for (const code of result) {
    for (const dependency of getPermissionDependencies(code)) result.add(dependency);
  }
  return [...result].sort();
}

export function togglePermissionOption(codes: string[], option: PermissionOption, enabled: boolean): string[] {
  if (enabled) return normalizePermissions([...codes, ...option.codes]);
  const removed = new Set(option.codes);
  const remaining = new Set(codes.filter((code) => !removed.has(code)));
  let changed = true;
  while (changed) {
    changed = false;
    for (const code of remaining) {
      if (getPermissionDependencies(code).some((dependency) => removed.has(dependency))) {
        remaining.delete(code);
        removed.add(code);
        changed = true;
      }
    }
  }
  // Las categorías son una dependencia interna, no una opción de consulta independiente.
  if (!remaining.has("products.read")) remaining.delete("categories.read");
  return normalizePermissions([...remaining]);
}

export const permissionPresets = [
  { name: "Cajero", description: "Consulta productos y registra o edita ventas.", codes: ["products.read", "sales.create", "sales.update"] },
  { name: "Empleado", description: "Consulta productos, ventas e historial de stock.", codes: ["products.read", "sales.read", "stock_movements.read"] },
  { name: "Gerente", description: "Gestiona la operación, sin administrar usuarios, roles ni dashboard.", codes: ["products.create", "products.update", "categories.create", "categories.update", "suppliers.create", "suppliers.update", "employees.read", "sales.create", "sales.update", "purchases.create", "purchases.update", "transactions.manage", "balances.manage", "stock_movements.create"] },
];
