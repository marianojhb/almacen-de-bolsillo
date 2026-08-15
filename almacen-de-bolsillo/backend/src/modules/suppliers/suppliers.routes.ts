import { Router } from "express";

// Supplier controller

import { deleteSupplier, getSupplierById, getSuppliers, postSupplier, updateSupplier } from "./suppliers.controller.js";

const suppliersRouter: Router = Router();

suppliersRouter.get("/", getSuppliers);

suppliersRouter.get("/:id", getSupplierById);

suppliersRouter.post("/", postSupplier);

suppliersRouter.patch("/:id", updateSupplier);

suppliersRouter.delete("/:id", deleteSupplier);

export default suppliersRouter;