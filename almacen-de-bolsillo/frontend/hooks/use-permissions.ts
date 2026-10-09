import { useCallback } from "react";
import { useAuth } from "@/contexts/auth";

export function usePermissions() {
  const { session } = useAuth();
  const permissions = session?.permissions;
  const can = useCallback((code: string) => permissions?.includes(code) ?? false, [permissions]);
  return { can };
}
