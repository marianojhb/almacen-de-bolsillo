import { hasPermission, type Action, type Resource } from "@almacen/shared";
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function usePermissions() {
  const { user } = useAuth();
  const can = useCallback((resource: Resource, action: Action) => user !== null && hasPermission(user.role, resource, action), [user]);
  const hasFullAccess = user?.role === "ADMIN" || user?.role === "BUSINESS_OWNER";
  return { can, hasFullAccess };
}
