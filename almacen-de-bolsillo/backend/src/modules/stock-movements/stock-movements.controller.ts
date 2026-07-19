import type { Request, Response } from "express";
import {
  getStockMovementsFromDatabase,
  getStockMovementByIdFromDatabase,
  getStockMovementsByProductIdFromDatabase,
  getStockMovementsByProductSkuFromDatabase,
  postStockMovementToDatabase,
  updateStockMovementFromDatabase,
  deleteStockMovementFromDatabase,
} from "./stock-movements.service.js";

const getStockMovements = async (req: Request, res: Response) => {
  try {
    const stockMovements = await getStockMovementsFromDatabase();
    res.json(stockMovements);
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getStockMovementById = async (req: Request, res: Response) => {
  const stockMovementId = Number(req.params.id);

  try {
    const stockMovement = await getStockMovementByIdFromDatabase(stockMovementId);

    if (stockMovement) {
      res.json(stockMovement);
    } else {
      res.status(404).json({ message: "Stock movement not found" });
    }
  } catch (error) {
    console.error("Error fetching stock movement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getStockMovementsByProductId = async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);

  try {
    const stockMovements = await getStockMovementsByProductIdFromDatabase(productId);
    res.json(stockMovements);
  } catch (error) {
    console.error("Error fetching stock movements by product ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getStockMovementsByProductSku = async (req: Request, res: Response) => {
  const productSku = req.params.productSku;

  if (typeof productSku !== "string" || productSku.trim() === "") {
    res.status(400).json({ message: "Invalid product SKU" });
    return;
  }

  try {
    const stockMovements = await getStockMovementsByProductSkuFromDatabase(productSku);
    res.json(stockMovements);
  } catch (error) {
    console.error("Error fetching stock movements by product SKU:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const postStockMovement = async (req: Request, res: Response) => {
  const stockMovementData = req.body;

  try {
    const newStockMovement = await postStockMovementToDatabase(stockMovementData);
    res.status(201).json(newStockMovement);
  } catch (error) {
    console.error("Error creating stock movement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateStockMovement = async (req: Request, res: Response) => {
  const stockMovementId = Number(req.params.id);
  const stockMovementData = req.body;

  try {
    const updatedStockMovement = await updateStockMovementFromDatabase(stockMovementId, stockMovementData);
    res.json(updatedStockMovement);
  } catch (error) {
    console.error("Error updating stock movement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteStockMovement = async (req: Request, res: Response) => {
  const stockMovementId = Number(req.params.id);

  try {
    const deletedStockMovement = await deleteStockMovementFromDatabase(stockMovementId);
    res.json(deletedStockMovement);
  } catch (error) {
    console.error("Error deleting stock movement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getStockMovements,
  getStockMovementById,
  getStockMovementsByProductId,
  getStockMovementsByProductSku,
  postStockMovement,
  updateStockMovement,
  deleteStockMovement,
};
