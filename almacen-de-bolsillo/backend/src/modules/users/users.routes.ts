import { Router } from "express";
import { getUsers, getUserById, postUser, updateUser, deleteUser, getEmployeeOptions } from "./users.controller.js";
import { requireAuth, requirePermission } from "../auth/auth.middleware.js";

const usersRouter: Router = Router();
usersRouter.use(requireAuth);

usersRouter.get("/", requirePermission("users.read"), getUsers);
usersRouter.get("/employee-options", requirePermission("users.manage"), getEmployeeOptions);
usersRouter.get("/:id", requirePermission("users.read"), getUserById);
usersRouter.post("/", requirePermission("users.manage"), postUser);
usersRouter.put("/:id", requirePermission("users.manage"), updateUser);
usersRouter.delete("/:id", requirePermission("users.manage"), deleteUser);

export default usersRouter;
