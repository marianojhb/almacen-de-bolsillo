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

stockMovementsRouter.get("/product/id/:productId", getStockMovementsByProductId); // + específica
stockMovementsRouter.get("/product/sku/:productSku", getStockMovementsByProductSku); // + específica
stockMovementsRouter.get("/:id", getStockMovementById); // menos específica

stockMovementsRouter.post("/", postStockMovement);

stockMovementsRouter.put("/:id", updateStockMovement);

stockMovementsRouter.delete("/:id", deleteStockMovement);

export default stockMovementsRouter;
