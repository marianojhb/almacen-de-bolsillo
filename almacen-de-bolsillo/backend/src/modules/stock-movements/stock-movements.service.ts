import { prisma } from "@/config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

const getStockMovementsFromDatabase = async () => prisma.stockMovement.findMany();

const getStockMovementByIdFromDatabase = async (stockMovementId: number) => {
  const stockMovement = await prisma.stockMovement.findUnique({
    where: { id: stockMovementId },
  });
  return stockMovement;
};

const getStockMovementsByProductIdFromDatabase = async (productId: number) => {
  const stockMovements = await prisma.stockMovement.findMany({
    where: { productId },
  });
  return stockMovements;
};

const getStockMovementsByProductSkuFromDatabase = async (productSku: string) => {
  const stockMovements = await prisma.stockMovement.findMany({
    where: {
      product: {
        sku: productSku,
      },
    },
  });

  return stockMovements;
};

// This function creates a new stock movement and updates the stock of the associated product. It uses a transaction to ensure that all operations are atomic.
const postStockMovementToDatabase = async (stockMovementData: Prisma.StockMovementUncheckedCreateInput) => {
  // Start a transaction to ensure atomicity
  return prisma.$transaction(async (transaction) => {
    // Fetch the current stock of the product
    const product = await transaction.product.findUnique({
      where: { id: stockMovementData.productId },
      select: { stock: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Determine the previous stock and new stock values
    const previousStock = stockMovementData.previousStock ?? product.stock;

    // Calculate the new stock based on the movement type and quantity
    const newStock = stockMovementData.newStock;

    // Create the stock movement record
    const stockMovement = await transaction.stockMovement.create({
      data: {
        ...stockMovementData,
        previousStock,
        newStock,
      },
    });

    // Update the product's stock
    await transaction.product.update({
      where: { id: stockMovementData.productId },
      data: { stock: newStock },
    });

    // Return the created stock movement record
    return stockMovement;
  });
};

const updateStockMovementFromDatabase = async (
  stockMovementId: number,
  stockMovementData: Prisma.StockMovementUpdateInput,
) => {
  const stockMovement = await prisma.stockMovement.update({
    where: { id: stockMovementId },
    data: stockMovementData,
  });
  return stockMovement;
};

const deleteStockMovementFromDatabase = async (stockMovementId: number) => {
  const stockMovement = await prisma.stockMovement.delete({
    where: { id: stockMovementId },
  });
  return stockMovement;
};

export {
  getStockMovementsFromDatabase,
  getStockMovementByIdFromDatabase,
  getStockMovementsByProductIdFromDatabase,
  getStockMovementsByProductSkuFromDatabase,
  postStockMovementToDatabase,
  updateStockMovementFromDatabase,
  deleteStockMovementFromDatabase,
};
