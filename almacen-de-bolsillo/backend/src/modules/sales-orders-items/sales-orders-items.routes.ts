import { Router } from "express";
import {
  getSalesOrderItems,
  getSalesOrderItemById,
  postSalesOrderItem,
  updateSalesOrderItem,
  deleteSalesOrderItem,
} from "./sales-orders-items.controller.js";

const salesOrderItemsRouter: Router = Router();

salesOrderItemsRouter.get("/", getSalesOrderItems);
salesOrderItemsRouter.get("/:salesOrderId/:productId", getSalesOrderItemById);
salesOrderItemsRouter.post("/", postSalesOrderItem);
salesOrderItemsRouter.put("/:salesOrderId/:productId", updateSalesOrderItem);
salesOrderItemsRouter.delete("/:salesOrderId/:productId", deleteSalesOrderItem);

export default salesOrderItemsRouter;
