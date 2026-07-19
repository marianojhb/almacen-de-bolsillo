import { Router } from "express";
import {
  getStockMovements,
  getStockMovementById,
  getStockMovementsByProductId,
  getStockMovementsByProductSku,
  postStockMovement,
  updateStockMovement,
  deleteStockMovement,
} from "./stock-movements.controller.js";

const stockMovementsRouter: Router = Router();

stockMovementsRouter.get("/", getStockMovements);

stockMovementsRouter.get("/:id", getStockMovementById);

stockMovementsRouter.get("/product/id/:productId", getStockMovementsByProductId);
stockMovementsRouter.get("/product/sku/:productId", getStockMovementsByProductSku);

stockMovementsRouter.post("/", postStockMovement);

stockMovementsRouter.put("/:id", updateStockMovement);

stockMovementsRouter.delete("/:id", deleteStockMovement);

export default stockMovementsRouter;
