import type {
  CreateEmployeeDto,
  EmployeeGender,
  UpdateEmployeeDto,
} from "@almacen/shared";
import type {
  Request,
  Response,
} from "express";

import {
  deactivateEmployeeFromDatabase,
  getEmployeeByDniFromDatabase,
  getEmployeeByIdFromDatabase,
  getEmployeesFromDatabase,
  permanentlyDeleteEmployeeFromDatabase,
  postEmployeeToDatabase,
  updateEmployeeFromDatabase,
} from "./employees.service.js";

type ValidationResult =
  | {
      data: UpdateEmployeeDto;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

const employeeGenders: EmployeeGender[] = [
  "M",
  "F",
  "OTHER",
];

const isValidEmployeeId = (
  employeeId: number,
) =>
  Number.isInteger(employeeId) &&
  employeeId > 0;

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(
    `${value}T00:00:00.000Z`,
  );

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value <= new Date().toISOString().slice(0, 10)
  );
};

const validateEmployeePayload = (
  body: unknown,
  isUpdate: boolean,
): ValidationResult => {
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return {
      data: null,
      error:
        "Los datos del empleado no son válidos.",
    };
  }

  const source = body as Record<
    string,
    unknown
  >;

  const data: UpdateEmployeeDto = {};

  if (
    !isUpdate ||
    source.firstname !== undefined
  ) {
    if (
      typeof source.firstname !== "string" ||
      !source.firstname.trim()
    ) {
      return {
        data: null,
        error: "El nombre es obligatorio.",
      };
    }

    data.firstname = source.firstname.trim();
  }

  if (
    !isUpdate ||
    source.lastname !== undefined
  ) {
    if (
      typeof source.lastname !== "string" ||
      !source.lastname.trim()
    ) {
      return {
        data: null,
        error: "El apellido es obligatorio.",
      };
    }

    data.lastname = source.lastname.trim();
  }

  if (!isUpdate || source.dni !== undefined) {
    if (typeof source.dni !== "string") {
      return {
        data: null,
        error: "El DNI es obligatorio.",
      };
    }

    const dni = source.dni.replace(/\D/g, "");

    if (!/^\d{7,8}$/.test(dni)) {
      return {
        data: null,
        error:
          "El DNI debe contener 7 u 8 números.",
      };
    }

    data.dni = dni;
  }

  if (source.cuil !== undefined) {
    if (
      source.cuil === null ||
      source.cuil === ""
    ) {
      data.cuil = null;
    } else if (
      typeof source.cuil !== "string"
    ) {
      return {
        data: null,
        error: "El CUIL no es válido.",
      };
    } else {
      const cuil =
        source.cuil.replace(/\D/g, "");

      if (!/^\d{11}$/.test(cuil)) {
        return {
          data: null,
          error:
            "El CUIL debe contener 11 números.",
        };
      }

      data.cuil = cuil;
    }
  }

  if (source.dob !== undefined) {
    if (
      source.dob === null ||
      source.dob === ""
    ) {
      data.dob = null;
    } else if (
      typeof source.dob !== "string" ||
      !isValidDate(source.dob)
    ) {
      return {
        data: null,
        error:
          "La fecha de nacimiento debe tener el formato AAAA-MM-DD y no puede ser futura.",
      };
    } else {
      data.dob = source.dob;
    }
  }

  if (source.salary !== undefined) {
    if (source.salary === null) {
      data.salary = null;
    } else if (
      typeof source.salary !== "number" ||
      !Number.isFinite(source.salary) ||
      source.salary < 0
    ) {
      return {
        data: null,
        error:
          "El salario debe ser un número mayor o igual a cero.",
      };
    } else {
      data.salary = source.salary;
    }
  }

  if (source.jobTitle !== undefined) {
    if (
      source.jobTitle !== null &&
      typeof source.jobTitle !== "string"
    ) {
      return {
        data: null,
        error: "El puesto no es válido.",
      };
    }

    data.jobTitle =
      typeof source.jobTitle === "string"
        ? source.jobTitle.trim() || null
        : null;
  }

  if (source.pto !== undefined) {
    if (
      source.pto !== null &&
      typeof source.pto !== "string"
    ) {
      return {
        data: null,
        error: "El PTO no es válido.",
      };
    }

    data.pto =
      typeof source.pto === "string"
        ? source.pto.trim() || null
        : null;
  }

  if (!isUpdate && source.gender === undefined) {
    data.gender = "M";
  } else if (source.gender !== undefined) {
    if (
      typeof source.gender !== "string" ||
      !employeeGenders.includes(
        source.gender as EmployeeGender,
      )
    ) {
      return {
        data: null,
        error: "El género no es válido.",
      };
    }

    data.gender =
      source.gender as EmployeeGender;
  }

  if (
    isUpdate &&
    source.isActive !== undefined
  ) {
    if (
      typeof source.isActive !== "boolean"
    ) {
      return {
        data: null,
        error: "El estado no es válido.",
      };
    }

    data.isActive = source.isActive;
  }

  if (
    isUpdate &&
    Object.keys(data).length === 0
  ) {
    return {
      data: null,
      error:
        "No se enviaron campos para actualizar.",
    };
  }

  return {
    data,
    error: null,
  };
};

const sendDatabaseError = (
  res: Response,
  error: unknown,
  action: string,
) => {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error
      ? String(error.code)
      : null;

  if (code === "P2002") {
    res.status(409).json({
      message:
        "Ya existe un empleado con ese DNI.",
    });
    return;
  }

  if (code === "P2025") {
    res.status(404).json({
      message: "Empleado no encontrado.",
    });
    return;
  }

  if (code === "P2003") {
    res.status(409).json({
      message:
        "No se puede eliminar físicamente el empleado porque tiene registros relacionados.",
    });
    return;
  }

  console.error(
    `Error ${action} employee:`,
    error,
  );

  res.status(500).json({
    message: "Error interno del servidor.",
  });
};

const getEmployees = async (
  req: Request,
  res: Response,
) => {
  try {
    const includeInactive =
      req.query.includeInactive === "true";

    const employees =
      await getEmployeesFromDatabase(
        includeInactive,
      );

    res.json(employees);
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "fetching",
    );
  }
};

const getEmployeeById = async (
  req: Request,
  res: Response,
) => {
  const employeeId = Number(req.params.id);

  if (!isValidEmployeeId(employeeId)) {
    res.status(400).json({
      message:
        "El ID del empleado no es válido.",
    });
    return;
  }

  try {
    const employee =
      await getEmployeeByIdFromDatabase(
        employeeId,
      );

    if (!employee) {
      res.status(404).json({
        message: "Empleado no encontrado.",
      });
      return;
    }

    res.json(employee);
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "fetching",
    );
  }
};

const postEmployee = async (
  req: Request,
  res: Response,
) => {
  const validation =
    validateEmployeePayload(req.body, false);

  if (validation.data === null) {
    res.status(400).json({
      message: validation.error,
    });
    return;
  }

  const employeeData =
    validation.data as CreateEmployeeDto;

  try {
    const existingEmployee =
      await getEmployeeByDniFromDatabase(
        employeeData.dni,
      );

    if (existingEmployee) {
      res.status(409).json({
        message:
          "Ya existe un empleado con ese DNI.",
      });
      return;
    }

    const employee =
      await postEmployeeToDatabase(
        employeeData,
      );

    res.status(201).json(employee);
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "creating",
    );
  }
};

const updateEmployee = async (
  req: Request,
  res: Response,
) => {
  const employeeId = Number(req.params.id);

  if (!isValidEmployeeId(employeeId)) {
    res.status(400).json({
      message:
        "El ID del empleado no es válido.",
    });
    return;
  }

  const validation =
    validateEmployeePayload(req.body, true);

  if (validation.data === null) {
    res.status(400).json({
      message: validation.error,
    });
    return;
  }

  const employeeData = validation.data;

  try {
    if (employeeData.dni) {
      const existingEmployee =
        await getEmployeeByDniFromDatabase(
          employeeData.dni,
          employeeId,
        );

      if (existingEmployee) {
        res.status(409).json({
          message:
            "Ya existe otro empleado con ese DNI.",
        });
        return;
      }
    }

    const employee =
      await updateEmployeeFromDatabase(
        employeeId,
        employeeData,
      );

    res.json(employee);
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "updating",
    );
  }
};

const deactivateEmployee = async (
  req: Request,
  res: Response,
) => {
  const employeeId = Number(req.params.id);

  if (!isValidEmployeeId(employeeId)) {
    res.status(400).json({
      message:
        "El ID del empleado no es válido.",
    });
    return;
  }

  try {
    await deactivateEmployeeFromDatabase(
      employeeId,
    );

    res.status(204).send();
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "deactivating",
    );
  }
};

const permanentlyDeleteEmployee = async (
  req: Request,
  res: Response,
) => {
  const employeeId = Number(req.params.id);

  if (!isValidEmployeeId(employeeId)) {
    res.status(400).json({
      message:
        "El ID del empleado no es válido.",
    });
    return;
  }

  try {
    await permanentlyDeleteEmployeeFromDatabase(
      employeeId,
    );

    res.status(204).send();
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "permanently deleting",
    );
  }
};

export {
  deactivateEmployee,
  getEmployeeById,
  getEmployees,
  permanentlyDeleteEmployee,
  postEmployee,
  updateEmployee,
};