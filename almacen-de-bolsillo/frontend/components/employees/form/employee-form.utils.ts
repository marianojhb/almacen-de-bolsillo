import {
    EMPLOYEE_ROLES,
    type CreateEmployeeWithUserDto,
    type EmployeeGender,
    type EmployeeRole,
    type UpdateEmployeeDto,
} from "@almacen/shared";

export type EmployeeFormState = {
    firstname: string;
    lastname: string;
    dni: string;
    cuil: string;
    dob: string;
    salary: string;
    jobTitle: string;
    gender: EmployeeGender;
    email: string;
    password: string;
    passwordConfirmation: string;
    role: EmployeeRole;
};

export type EmployeeFieldsProps = {
    values: EmployeeFormState;
    onChange: (changes: Partial<EmployeeFormState>) => void;
    disabled: boolean;
    mode: "create" | "edit";
    showAccountFields: boolean;
};

type ValidationResult<T> = { ok: true; data: T } | { ok: false; message: string };

export function createEmployeeFormState(values?: Partial<CreateEmployeeWithUserDto>): EmployeeFormState {
    return {
        firstname: values?.firstname ?? "",
        lastname: values?.lastname ?? "",
        dni: values?.dni ?? "",
        cuil: values?.cuil ?? "",
        dob: values?.dob?.slice(0, 10) ?? "",
        salary: values?.salary?.toString() ?? "",
        jobTitle: values?.jobTitle ?? "",
        gender: values?.gender ?? "M",
        email: values?.email ?? "",
        password: "",
        passwordConfirmation: "",
        role: values?.role ?? "EMPLOYEE",
    };
}

function isValidBirthDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value &&
        value <= new Date().toISOString().slice(0, 10)
    );
}

export function validateEmployeeForm(values: EmployeeFormState, mode: "create"): ValidationResult<CreateEmployeeWithUserDto>;
export function validateEmployeeForm(values: EmployeeFormState, mode: "edit", showAccountFields?: boolean): ValidationResult<UpdateEmployeeDto>;
export function validateEmployeeForm(
    values: EmployeeFormState,
    mode: "create" | "edit",
    showAccountFields = true,
): ValidationResult<CreateEmployeeWithUserDto | UpdateEmployeeDto> {
    const firstname = values.firstname.trim();
    const lastname = values.lastname.trim();
    const dni = values.dni.replace(/\D/g, "");
    const cuil = values.cuil.replace(/\D/g, "");
    const dob = values.dob.trim();

    const salaryText = values.salary.trim().replace(",", ".");
    const salary = salaryText ? Number(salaryText) : null;

    if (!firstname) {
        return {
            ok: false,
            message: "Ingresá el nombre del empleado.",
        };
    }

    if (!lastname) {
        return {
            ok: false,
            message: "Ingresá el apellido del empleado.",
        };
    }

    if (!/^\d{7,8}$/.test(dni)) {
        return {
            ok: false,
            message: "El DNI debe contener 7 u 8 números.",
        };
    }

    if (cuil && !/^\d{11}$/.test(cuil)) {
        return {
            ok: false,
            message: "El CUIL debe contener 11 números.",
        };
    }

    if (dob && !isValidBirthDate(dob)) {
        return {
            ok: false,
            message: "Ingresá una fecha válida en formato AAAA-MM-DD que no sea futura.",
        };
    }

    if (salary !== null && (!Number.isFinite(salary) || salary < 0)) {
        return {
            ok: false,
            message: "El salario debe ser mayor o igual a cero.",
        };
    }

    const data: UpdateEmployeeDto = {
        firstname,
        lastname,
        dni,
        cuil: cuil || null,
        dob: dob || null,
        salary,
        jobTitle: values.jobTitle.trim() || null,
        gender: values.gender,
    };

    if (mode === "create" || showAccountFields) {
        const email = values.email.trim().toLowerCase();
        const role = EMPLOYEE_ROLES.find((value) => value === values.role);

        if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { ok: false, message: "Ingresá un email de acceso válido." };
        }

        if (!role) {
            return { ok: false, message: "Seleccioná un rol válido." };
        }

        if ((mode === "create" || values.password.length > 0) &&
            (values.password.length < 8 || values.password.length > 128)) {
            return { ok: false, message: "La contraseña debe tener entre 8 y 128 caracteres." };
        }

        if (values.password !== values.passwordConfirmation) {
            return { ok: false, message: "Las contraseñas no coinciden. Volvé a confirmarlas." };
        }

        data.email = email;
        data.role = role;

        if (mode === "create" || values.password.length > 0) {
            data.password = values.password;
        }
    }

    return {
        ok: true,
        data,
    };
}
