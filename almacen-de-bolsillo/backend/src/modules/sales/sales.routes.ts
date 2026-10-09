import { Router } from "express";
import { getSalesOrders, getSalesOrderById, postSalesOrder, updateSalesOrder, deleteSalesOrder } from "./sales.controller.js";
import { requireAuth, requirePermission } from "../auth/auth.middleware.js";

const salesOrdersRouter: Router = Router();
salesOrdersRouter.use(requireAuth);

salesOrdersRouter.get("/", requirePermission("sales.read"), getSalesOrders);
salesOrdersRouter.get("/:id", requirePermission("sales.read"), getSalesOrderById);
salesOrdersRouter.post("/", requirePermission("sales.create"), postSalesOrder);
salesOrdersRouter.put("/:id", requirePermission("sales.update"), updateSalesOrder);
salesOrdersRouter.delete("/:id", requirePermission("sales.delete"), deleteSalesOrder);

export default salesOrdersRouter;
