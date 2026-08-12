import { Router } from "express";

// Supplier controller

import { deleteSupplier, getSupplierById, getSuppliers, postSupplier, updateSupplier } from "./suppliers.controller.js";

// Supplier with products

import { getSupplierProducts, updateSupplierProducts } from "./suppliers.controller.js";

const suppliersRouter: Router = Router();

suppliersRouter.get("/", getSuppliers);

suppliersRouter.get("/:id", getSupplierById);

suppliersRouter.post("/", postSupplier);

suppliersRouter.patch("/:id", updateSupplier);

suppliersRouter.put("/:id", updateSupplier);

suppliersRouter.delete("/:id", deleteSupplier);

// Supplier with products

suppliersRouter.get("/:id/products", getSupplierProducts);

suppliersRouter.patch("/:id/products", updateSupplierProducts);

export default suppliersRouter;