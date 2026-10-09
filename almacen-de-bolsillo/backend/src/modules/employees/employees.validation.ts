import type { CreateEmployeeDto, EmployeeGender, UpdateEmployeeDto } from "@almacen/shared";
import { ApiError } from "../auth/request.utils.js";

const employeeGenders: EmployeeGender[] = [
  "M",
  "F",
  "OTHER",
];

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value 
    && value <= new Date().toISOString().slice(0, 10));
};

const validateEmployeePayload = (body: unknown, isUpdate: boolean): UpdateEmployeeDto => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ApiError(400, "Los datos del empleado no son válidos.");
  }

  const source = body as Record<string,unknown>;

  const allowedFields = ["firstname", "lastname", "dni", "cuil", "dob", "salary", "jobTitle", "gender", ...(isUpdate ? ["isActive"] : [])];

  if (Object.keys(source).some((key) => !allowedFields.includes(key))) {
    throw new ApiError(400, "Se enviaron campos no permitidos del empleado.");
  }
  const data: UpdateEmployeeDto = {};

  if (!isUpdate || source.firstname !== undefined) {
    if (typeof source.firstname !== "string" || !source.firstname.trim()) {
      throw new ApiError(400, "El nombre es obligatorio.");
    }

    data.firstname = source.firstname.trim();
  }

  if (!isUpdate || source.lastname !== undefined) {
    if (typeof source.lastname !== "string" || !source.lastname.trim()) {
      throw new ApiError(400, "El apellido es obligatorio.");
    }

    data.lastname = source.lastname.trim();
  }

  if (!isUpdate || source.dni !== undefined) {
    if (typeof source.dni !== "string") {
      throw new ApiError(400, "El DNI es obligatorio.");
    }

    const dni = source.dni.replace(/\D/g, "");

    if (!/^\d{7,8}$/.test(dni)) {
      throw new ApiError(400, "El DNI debe contener 7 u 8 números.");
    }

    data.dni = dni;
  }

  if (source.cuil !== undefined) {
    if (source.cuil === null || source.cuil === "") {
      data.cuil = null;
    } else if (typeof source.cuil !== "string") {
      throw new ApiError(400, "El CUIL no es válido.");
    } else {
      const cuil = source.cuil.replace(/\D/g, "");

      if (!/^\d{11}$/.test(cuil)) {
        throw new ApiError(400, "El CUIL debe contener 11 números.");
      }

      data.cuil = cuil;
    }
  }

  if (source.dob !== undefined) {
    if (source.dob === null || source.dob === "") {
      data.dob = null;
    } else if (
      typeof source.dob !== "string" || !isValidDate(source.dob)
    ) {
      throw new ApiError(400, "La fecha de nacimiento debe tener el formato AAAA-MM-DD y no puede ser futura.");
    } else {
      data.dob = source.dob;
    }
  }

  if (source.salary !== undefined) {
    if (source.salary === null) {
      data.salary = null;
    } else if (
      typeof source.salary !== "number" || !Number.isFinite(source.salary) || source.salary < 0 || source.salary > 99999999.99
    ) {
      throw new ApiError(400, "El salario debe ser un número mayor o igual a cero.");
    } else {
      data.salary = source.salary;
    }
  }

  if (source.jobTitle !== undefined) {
    if (source.jobTitle !== null && typeof source.jobTitle !== "string") {
      throw new ApiError(400, "El puesto no es válido.");
    }

    data.jobTitle = typeof source.jobTitle === "string" ? source.jobTitle.trim() || null : null;
  }

  if (!isUpdate && source.gender === undefined) {
    data.gender = "M";
  } else if (source.gender !== undefined) {
    if (typeof source.gender !== "string" || !employeeGenders.includes(source.gender as EmployeeGender)) {
      throw new ApiError(400, "El género no es válido.");
    }

    data.gender = source.gender as EmployeeGender;
  }

  if (isUpdate && source.isActive !== undefined) {
    if (typeof source.isActive !== "boolean") {
      throw new ApiError(400, "El estado no es válido.");
    }

    data.isActive = source.isActive;
  }

  if (isUpdate && Object.keys(data).length === 0) {
    throw new ApiError(400, "No se enviaron campos para actualizar.");
  }

  return data;
};

export const validateUpdateEmployee = (body: unknown): UpdateEmployeeDto => validateEmployeePayload(body, true);

export const validateCreateEmployee = (body: unknown): CreateEmployeeDto => {
  const data = validateEmployeePayload(body, false);
  if (!data.firstname || !data.lastname || !data.dni) {
    throw new ApiError(400, "El nombre, apellido y DNI son obligatorios.");
  }
  return { ...data, firstname: data.firstname, lastname: data.lastname, dni: data.dni, gender: data.gender ?? "M" };
};
