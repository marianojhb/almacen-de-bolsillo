import type { AuthUser } from "../auth/auth.types.js";
import type { EmployeeRole } from "../users/user.types.js";

export type EmployeeGender = | "M" | "F" | "OTHER";

export type Employee = {
    id: number;
    firstname: string | null;
    lastname: string | null;
    fullname: string | null;
    dni: string | null;
    cuil: string | null;
    dob: string | null;
    salary: number | string | null;
    jobTitle: string | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    gender: EmployeeGender;

    userId: number | null;
    user: (AuthUser & { isActive: boolean }) | null;
};

export type CreateEmployeeDto = {
    firstname: string;
    lastname: string;
    dni: string;
    cuil?: string | null;
    dob?: string | null;
    salary?: number | null;
    jobTitle?: string | null;
    gender: EmployeeGender;
};


export type EmployeeAccountDto = {
  email: string;
  password: string;
  role: EmployeeRole;
};

export type CreateEmployeeWithUserDto =
  CreateEmployeeDto & EmployeeAccountDto;

export type UpdateEmployeeDto = Partial<CreateEmployeeWithUserDto> & {
    isActive?: boolean;
};
