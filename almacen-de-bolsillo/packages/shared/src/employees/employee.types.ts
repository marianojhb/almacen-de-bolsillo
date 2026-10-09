export type EmployeeGender = | "M" | "F" | "OTHER";

export type Employee = {
    id: number;
    commerceEmployeeId: number;
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
    account: { id: number; username: string | null; role: { id: number; name: string } } | null;
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

export type UpdateEmployeeDto = Partial<CreateEmployeeDto> & {
    isActive?: boolean;
};
