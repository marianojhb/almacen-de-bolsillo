import type { Role } from "../users/user.types.js";
import type { EmployeeGender } from "../employees/employee.types.js";

export type AuthUser = {
  id: number;
  email: string;
  role: Role;
  employee?: {
    firstname: string | null;
    lastname: string | null;
    fullname: string | null;
    dni: string | null;
    gender: EmployeeGender;
  } | null;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: AuthUser;
};

export type CreateOwnerDto = LoginDto & {
  firstname: string;
  lastname: string;
  dni: string;
  gender: EmployeeGender;
};

export type SetupStatus = {
  ownerExists: boolean;
};
