export type PermissionDto = {
  id: number;
  code: string;
  name: string;
  description: string | null;
};

export type CommerceRoleDto = {
  id: number;
  name: string;
  description: string | null;
  commerceId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: {
    roleId: number;
    permissionId: number;
    permission: PermissionDto;
  }[];
};

export type CreateCommerceRoleDto = {
  name: string;
  description: string | null;
  permissions: string[];
};

export type UpdateCommerceRoleDto = Partial<CreateCommerceRoleDto> & {
  isActive?: boolean;
};
