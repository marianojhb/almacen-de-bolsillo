import { Router } from "express";
import { requireAuth, requirePermission } from "../auth/auth.middleware.js";
import { getRoles, getRoleById, getPermissions, postRole, updateRole, deleteRole } from "./roles.controller.js";

const rolesRouter: Router = Router();
rolesRouter.use(requireAuth);
rolesRouter.get("/", requirePermission("roles.read"), getRoles);
rolesRouter.get("/permissions", requirePermission("roles.manage"), getPermissions);
rolesRouter.get("/:id", requirePermission("roles.read"), getRoleById);
rolesRouter.post("/", requirePermission("roles.manage"), postRole);
rolesRouter.patch("/:id", requirePermission("roles.manage"), updateRole);
rolesRouter.delete("/:id", requirePermission("roles.manage"), deleteRole);

export default rolesRouter;
