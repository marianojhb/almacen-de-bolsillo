import { Router } from "express";
import { getProducts, getProductById, postProduct, updateProduct, deleteProduct } from "./products.controller.js";
import { requireAuth, requirePermission } from "../auth/auth.middleware.js";

const productsRouter: Router = Router();
productsRouter.use(requireAuth);

productsRouter.get("/", requirePermission("products.read"), getProducts);

productsRouter.get("/:id", requirePermission("products.read"), getProductById);

productsRouter.post("/", requirePermission("products.create"), postProduct);

productsRouter.patch("/:id", requirePermission("products.update"), updateProduct);

productsRouter.put("/:id", requirePermission("products.update"), updateProduct);

productsRouter.delete("/:id", requirePermission("products.delete"), deleteProduct);

export default productsRouter;
