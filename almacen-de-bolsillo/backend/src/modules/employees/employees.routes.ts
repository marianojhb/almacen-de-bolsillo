import { Router } from "express";

import {
  deactivateEmployee,
  getEmployeeById,
  getEmployees,
  permanentlyDeleteEmployee,
  postEmployee,
  updateEmployee,
} from "./employees.controller.js";

const employeesRouter: Router = Router();

employeesRouter.get("/", getEmployees);

employeesRouter.get(
  "/:id",
  getEmployeeById,
);

employeesRouter.post("/", postEmployee);

employeesRouter.patch(
  "/:id",
  updateEmployee,
);

employeesRouter.delete(
  "/:id/permanent",
  permanentlyDeleteEmployee,
);

employeesRouter.delete(
  "/:id",
  deactivateEmployee,
);

export default employeesRouter;