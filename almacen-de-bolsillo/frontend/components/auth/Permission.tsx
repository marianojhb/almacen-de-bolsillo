import type { Action, Resource } from "@almacen/shared";
import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

export function Permission({ resource, action, children }: { resource: Resource; action: Action; children: ReactNode }) {
  const { can } = usePermissions();
  return can(resource, action) ? <>{children}</> : null;
}
