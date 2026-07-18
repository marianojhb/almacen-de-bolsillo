import { Router } from "express";
import {
  getStockMovements,
  getStockMovementById,
  getStockMovementsByProductId,
  postStockMovement,
  updateStockMovement,
  deleteStockMovement,
} from "./stock-movements.controller.js";

const stockMovementsRouter: Router = Router();

stockMovementsRouter.get("/", getStockMovements);

stockMovementsRouter.get("/:id", getStockMovementById);

stockMovementsRouter.get("/product/:productId", getStockMovementsByProductId);

stockMovementsRouter.post("/", postStockMovement);

stockMovementsRouter.put("/:id", updateStockMovement);

stockMovementsRouter.delete("/:id", deleteStockMovement);

export default stockMovementsRouter;
