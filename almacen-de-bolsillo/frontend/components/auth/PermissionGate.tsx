import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";

export function PermissionGate({ permission, children }: { permission: string; children: ReactNode }) {
  const { can } = usePermissions();
  return can(permission) ? <>{children}</> : null;
}
