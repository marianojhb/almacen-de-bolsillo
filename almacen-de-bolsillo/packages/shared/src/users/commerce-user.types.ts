import type { User } from "./user.types.js";

export type CommerceUserDto = User & {
  commerceRole: { id: number; name: string };
  isOwner: boolean;
  employee: { id: number; name: string; isActive: boolean } | null;
};

export type CreateCommerceUserDto = {
  username: string;
  email: string;
  password: string;
  roleId: number;
  employeeId?: number | null;
};

export type UpdateCommerceUserDto = Partial<CreateCommerceUserDto> & {
  isActive?: boolean;
};

// Datos mínimos para vincular una ficha laboral, sin exponer salario ni datos personales.
export type EmployeeAccountOption = {
  id: number;
  commerceEmployeeId: number;
  name: string;
  isActive: boolean;
  userId: number | null;
};
