import { Router } from "express";
import {
  getStockMovements, getStockMovementById, getStockMovementsByProductId,
  getStockMovementsByProductSku, postStockMovement, updateStockMovement, deleteStockMovement,
} from "./stock-movements.controller.js";
import { requireAuth, requirePermission } from "../auth/auth.middleware.js";

const stockMovementsRouter: Router = Router();
stockMovementsRouter.use(requireAuth);
stockMovementsRouter.get("/", requirePermission("stock_movements.read"), getStockMovements);
stockMovementsRouter.get("/product/id/:productId", requirePermission("stock_movements.read"), getStockMovementsByProductId);
stockMovementsRouter.get("/product/sku/:productSku", requirePermission("stock_movements.read"), getStockMovementsByProductSku);
stockMovementsRouter.get("/:id", requirePermission("stock_movements.read"), getStockMovementById);
stockMovementsRouter.post("/", requirePermission("stock_movements.create"), postStockMovement);
// El historial se conserva; las correcciones se registran como nuevos ajustes.
stockMovementsRouter.put("/:id", updateStockMovement);
stockMovementsRouter.delete("/:id", deleteStockMovement);

export default stockMovementsRouter;
