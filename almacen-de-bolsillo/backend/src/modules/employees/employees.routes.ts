import { Router } from "express";
import {
  getEmployees, getEmployeeById, postEmployee, updateEmployee,
  deactivateEmployee, permanentlyDeleteEmployee,
} from "./employees.controller.js";
import { requireAuth, requirePermission } from "../auth/auth.middleware.js";

const employeesRouter: Router = Router();
employeesRouter.use(requireAuth);

employeesRouter.get("/", requirePermission("employees.read"), getEmployees);
employeesRouter.get("/:id", requirePermission("employees.read"), getEmployeeById);
employeesRouter.post("/", requirePermission("employees.create"), postEmployee);
employeesRouter.patch("/:id", requirePermission("employees.update"), updateEmployee);
employeesRouter.delete("/:id/permanent", requirePermission("employees.delete"), permanentlyDeleteEmployee);
employeesRouter.delete("/:id", requirePermission("employees.deactivate"), deactivateEmployee);

export default employeesRouter;
