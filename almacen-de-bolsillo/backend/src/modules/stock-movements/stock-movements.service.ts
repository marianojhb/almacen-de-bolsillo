import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

const getStockMovementsFromDatabase = async () => prisma.stockMovements.findMany();

const getStockMovementByIdFromDatabase = async (stockMovementId: number) => {
  const stockMovement = await prisma.stockMovements.findUnique({
    where: { id: stockMovementId },
  });
  return stockMovement;
};

const getStockMovementsByProductIdFromDatabase = async (productId: number) => {
  const stockMovements = await prisma.stockMovements.findMany({
    where: { productId },
  });
  return stockMovements;
};

const postStockMovementToDatabase = async (stockMovementData: Prisma.StockMovementsCreateInput) => {
  const stockMovement = await prisma.stockMovements.create({
    data: stockMovementData,
  });

  return stockMovement;
};

const updateStockMovementFromDatabase = async (
  stockMovementId: number,
  stockMovementData: Prisma.StockMovementsUpdateInput,
) => {
  const stockMovement = await prisma.stockMovements.update({
    where: { id: stockMovementId },
    data: stockMovementData,
  });
  return stockMovement;
};

const deleteStockMovementFromDatabase = async (stockMovementId: number) => {
  const stockMovement = await prisma.stockMovements.delete({
    where: { id: stockMovementId },
  });
  return stockMovement;
};

export {
  getStockMovementsFromDatabase,
  getStockMovementByIdFromDatabase,
  getStockMovementsByProductIdFromDatabase,
  postStockMovementToDatabase,
  updateStockMovementFromDatabase,
  deleteStockMovementFromDatabase,
};
