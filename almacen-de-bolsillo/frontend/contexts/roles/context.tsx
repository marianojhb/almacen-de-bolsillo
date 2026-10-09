import { createContext } from "react";
import type { CommerceRoleDto, CreateCommerceRoleDto, UpdateCommerceRoleDto, PermissionDto } from "@almacen/shared";

type RolesContextType = {
  roles: CommerceRoleDto[];
  isLoadingRoles: boolean;
  rolesError: string | null;
  refreshRoles: () => Promise<void>;
  addRole: (data: CreateCommerceRoleDto) => Promise<CommerceRoleDto>;
  updateRole: (id: number, data: UpdateCommerceRoleDto) => Promise<CommerceRoleDto>;
  deleteRole: (id: number) => Promise<void>;
  permissions: PermissionDto[];
  isLoadingPermissions: boolean;
  permissionsError: string | null;
  refreshPermissions: () => Promise<void>;
};

export const RolesContext = createContext<RolesContextType | undefined>(undefined);
