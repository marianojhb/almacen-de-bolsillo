import { getRequestSession } from "../auth/auth.middleware.js";
import { checkPermission, readId, sendApiError } from "../auth/request.utils.js";
import { validateCreateEmployee, validateUpdateEmployee } from "./employees.validation.js";
import type { Request, Response} from "express";
import {
  deactivateEmployeeFromDatabase,
  getEmployeeByDniFromDatabase,
  getEmployeeByIdFromDatabase,
  getEmployeesFromDatabase,
  permanentlyDeleteEmployeeFromDatabase,
  postEmployeeToDatabase,
  updateEmployeeFromDatabase,
} from "./employees.service.js";

const databaseMessages = {
  duplicate: "Ya existe un empleado con ese DNI o número interno en este comercio.",
  notFound: "Empleado no encontrado.",
  related: "No se puede eliminar físicamente el empleado porque tiene registros relacionados.",
  internal: "Error interno del servidor.",
};

const getEmployees = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const includeInactive = req.query.includeInactive === "true";

    const employees = await getEmployeesFromDatabase(includeInactive, session.commerce.id);

    res.json(employees);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const employeeId = readId(req.params.id);

    const employee =
      await getEmployeeByIdFromDatabase(employeeId, session.commerce.id);

    if (!employee) {
      res.status(404).json({
        message: "Empleado no encontrado.",
      });
      return;
    }

    res.json(employee);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const postEmployee = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const employeeData = validateCreateEmployee(req.body);

    const existingEmployee =
      await getEmployeeByDniFromDatabase(employeeData.dni, session.commerce.id);

    if (existingEmployee) {
      res.status(409).json({
        message: "Ya existe un empleado con ese DNI.",
      });
      return;
    }

    const employee = await postEmployeeToDatabase(employeeData, session.commerce.id);

    res.status(201).json(employee);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const updateEmployee = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const employeeId = readId(req.params.id);

    const employeeData = validateUpdateEmployee(req.body);

    if (employeeData.isActive === false) {
      checkPermission(session.permissions, "employees.deactivate");
    }
    const currentEmployee = await getEmployeeByIdFromDatabase(employeeId, session.commerce.id);
    if (!currentEmployee) {
      res.status(404).json({ message: "Empleado no encontrado." });
      return;
    }
    if (employeeData.dni) {
      const existingEmployee =
        await getEmployeeByDniFromDatabase(employeeData.dni, session.commerce.id, employeeId);

      if (existingEmployee) {
        res.status(409).json({ message: "Ya existe otro empleado con ese DNI." });
        return;
      }
    }

    const employee = await updateEmployeeFromDatabase(employeeId, employeeData, session.commerce.id, session.user.id);

    res.json(employee);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const deactivateEmployee = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const employeeId = readId(req.params.id);

    await deactivateEmployeeFromDatabase(employeeId, session.commerce.id, session.user.id);

    res.status(204).send();
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const permanentlyDeleteEmployee = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const employeeId = readId(req.params.id);

    await permanentlyDeleteEmployeeFromDatabase(employeeId, session.commerce.id);

    res.status(204).send();
  } catch (error) {
    sendApiError(res, error, databaseMessages);
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
