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
    pto: string | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    gender: EmployeeGender;
};

export type CreateEmployeeDto = {
    firstname: string;
    lastname: string;
    dni: string;
    cuil?: string | null;
    dob?: string | null;
    salary?: number | null;
    jobTitle?: string | null;
    pto?: string | null;
    gender: EmployeeGender;
};

export type UpdateEmployeeDto = Partial<CreateEmployeeDto> & {
    isActive?: boolean;
};