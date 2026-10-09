import { Router } from "express";
import { getPurchaseOrders, getPurchaseOrderById, postPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from "./purchases.controller.js";
import { requireAuth, requirePermission } from "../auth/auth.middleware.js";

const purchaseOrdersRouter: Router = Router();
purchaseOrdersRouter.use(requireAuth);

purchaseOrdersRouter.get("/", requirePermission("purchases.read"), getPurchaseOrders);
purchaseOrdersRouter.get("/:id", requirePermission("purchases.read"), getPurchaseOrderById);
purchaseOrdersRouter.post("/", requirePermission("purchases.create"), postPurchaseOrder);
purchaseOrdersRouter.put("/:id", requirePermission("purchases.update"), updatePurchaseOrder);
purchaseOrdersRouter.delete("/:id", requirePermission("purchases.delete"), deletePurchaseOrder);

export default purchaseOrdersRouter;
