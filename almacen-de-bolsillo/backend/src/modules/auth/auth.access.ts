type UserAccessState = {
  commerceId: number;
  isActive: boolean;
  commerce: { id: number; isActive: boolean };
  role: { commerceId: number; isActive: boolean };
  employee: { commerceId: number; isActive: boolean } | null;
};

// Estar activo no alcanza: usuario, rol y empleado deben pertenecer al mismo comercio.
// No tener empleado permite acceder; tener uno dado de baja bloquea el acceso.
export const isUserEnabled = (user: UserAccessState) =>
  user.isActive && user.commerce.isActive && user.role.isActive &&
  user.commerceId === user.commerce.id && user.role.commerceId === user.commerceId &&
  (user.employee === null || (user.employee.isActive && user.employee.commerceId === user.commerceId));

// El dueño entra desde Comercio; los demás usuarios entran desde Usuario.
export const canUseLoginMode = ( 
  user: { id: number; commerce: { ownerId: number } }, 
  mode: "commerce" | "user",
) => mode === "commerce" ? user.id === user.commerce.ownerId : user.id !== user.commerce.ownerId;
