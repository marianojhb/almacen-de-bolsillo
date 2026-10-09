import { birthDateInputToIso, formatBirthDateDisplay, type CreateEmployeeDto, type EmployeeGender } from "@almacen/shared";

export type EmployeeFormState = {
    firstname: string;
    lastname: string;
    dni: string;
    cuil: string;
    dob: string;
    salary: string;
    jobTitle: string;
    gender: EmployeeGender;
};

export type EmployeeFieldsProps = {
    values: EmployeeFormState;
    onChange: (changes: Partial<EmployeeFormState>) => void;
    disabled: boolean;
};

type ValidationResult = { ok: true; data: CreateEmployeeDto } | { ok: false; message: string };

export function createEmployeeFormState(values?: Partial<CreateEmployeeDto>): EmployeeFormState {
    return {
        firstname: values?.firstname ?? "",
        lastname: values?.lastname ?? "",
        dni: values?.dni ?? "",
        cuil: values?.cuil ?? "",
        dob: formatBirthDateDisplay(values?.dob ?? ""),
        salary: values?.salary?.toString() ?? "",
        jobTitle: values?.jobTitle ?? "",
        gender: values?.gender ?? "M",
    };
}

export function validateEmployeeForm(values: EmployeeFormState): ValidationResult {
    const firstname = values.firstname.trim();
    const lastname = values.lastname.trim();
    const dni = values.dni.replace(/\D/g, "");
    const cuil = values.cuil.replace(/\D/g, "");
    const dob = birthDateInputToIso(values.dob.trim());

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

    if (values.dob.trim() && !dob) {
        return {
            ok: false,
            message: "Ingresá una fecha válida en formato DD/MM/AAAA que no sea futura.",
        };
    }

    if (salary !== null && (!Number.isFinite(salary) || salary < 0)) {
        return {
            ok: false,
            message: "El salario debe ser mayor o igual a cero.",
        };
    }

    return {
        ok: true,
        data: {
            firstname,
            lastname,
            dni,
            cuil: cuil || null,
            dob: dob || null,
            salary,
            jobTitle: values.jobTitle.trim() || null,
            gender: values.gender,
        },
    };
}
