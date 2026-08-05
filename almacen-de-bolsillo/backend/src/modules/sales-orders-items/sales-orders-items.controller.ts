import type { Request, Response } from "express";

import {
  getSalesOrderItemsFromDatabase,
  getSalesOrderItemByIdFromDatabase,
  postSalesOrderItemToDatabase,
  updateSalesOrderItemFromDatabase,
  deleteSalesOrderItemFromDatabase,
} from "./sales-orders-items.service.js";

const getSalesOrderItems = async (req: Request, res: Response) => {
  try {
    res.json(await getSalesOrderItemsFromDatabase());
  } catch (error) {
    console.error("Error fetching sales order items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getSalesOrderItemById = async (req: Request, res: Response) => {
  const salesOrderItemId = Number(req.params.salesOrderId);
  const productId = Number(req.params.productId);

  try {
    const salesOrderItem = await getSalesOrderItemByIdFromDatabase(salesOrderItemId, productId);
    salesOrderItem ? res.json(salesOrderItem) : res.status(404).json({ message: "Sales order item not found" });
  } catch (error) {
    console.error("Error fetching sales order item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const postSalesOrderItem = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await postSalesOrderItemToDatabase(req.body));
  } catch (error) {
    console.error("Error creating sales order item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateSalesOrderItem = async (req: Request, res: Response) => {
  const salesOrderItemId = Number(req.params.salesOrderId);
  const productId = Number(req.params.productId);

  try {
    res.json(await updateSalesOrderItemFromDatabase(salesOrderItemId, productId, req.body));
  } catch (error) {
    console.error("Error updating sales order item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteSalesOrderItem = async (req: Request, res: Response) => {
  const salesOrderItemId = Number(req.params.salesOrderId);
  const productId = Number(req.params.productId);

  try {
    await deleteSalesOrderItemFromDatabase(salesOrderItemId, productId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting sales order item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { getSalesOrderItems, getSalesOrderItemById, postSalesOrderItem, updateSalesOrderItem, deleteSalesOrderItem };
