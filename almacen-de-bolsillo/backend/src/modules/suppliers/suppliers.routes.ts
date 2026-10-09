import { Router } from "express";

// Supplier controller

import { deleteSupplier, getSupplierOptions, getSupplierById, getSuppliers, postSupplier, updateSupplier } from "./suppliers.controller.js";
import { requireAuth, requirePermission, requireAnyPermission } from "../auth/auth.middleware.js";

const suppliersRouter: Router = Router();
suppliersRouter.use(requireAuth);

// Datos mínimos para productos y compras; no habilita la gestión de proveedores.
suppliersRouter.get("/options", requireAnyPermission("products.read", "suppliers.read"), getSupplierOptions);

suppliersRouter.get("/", requirePermission("suppliers.read"), getSuppliers);

suppliersRouter.get("/:id", requirePermission("suppliers.read"), getSupplierById);

suppliersRouter.post("/", requirePermission("suppliers.create"), postSupplier);

suppliersRouter.patch("/:id", requirePermission("suppliers.update"), updateSupplier);

suppliersRouter.delete("/:id", requirePermission("suppliers.delete"), deleteSupplier);

export default suppliersRouter;
