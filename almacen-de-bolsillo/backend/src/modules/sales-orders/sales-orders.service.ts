import { prisma } from "@/config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";
import type { CreateSalesOrderDto } from "@almacen/shared";

const getSalesOrdersFromDatabase = async () =>
  prisma.salesOrder.findMany({
    include: {
      salesOrderItems: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

const getSalesOrderByIdFromDatabase = async (salesOrderId: number) =>
  prisma.salesOrder.findUnique({
    where: { id: salesOrderId },
    include: { salesOrderItems: true },
  });

// This function creates a new sales order along with its items, updates the stock of the products involved, and creates stock movement records. It uses a transaction to ensure that all operations are atomic.
const postSalesOrderToDatabase = async (salesOrderData: CreateSalesOrderDto) => {
  const { salesOrderItems, sellerId, ...newSalesOrders } = salesOrderData;

  // Start a transaction to ensure atomicity
  return prisma.$transaction(async (tx) => {
    // Extract product IDs from sales order items
    const productIds = salesOrderItems.map((item) => item.productId);

    // Fetch products and check stock availability
    const products = await tx.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: {
        id: true,
        stock: true,
      },
    });

    // Create a map of products for easy access
    const productsById = new Map(products.map((product) => [product.id, product]));

    for (const item of salesOrderItems) {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} not found or inactive`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }

    // Create the sales order and related records
    const salesOrder = await tx.salesOrder.create({
      data: {
        ...newSalesOrders,
        seller: {
          connect: { id: sellerId },
        },
        transaction: {
          create: {
            amount: newSalesOrders.total,
            paymentMethod: newSalesOrders.paymentMethod,
            direction: "INCOME",
          },
        },
        salesOrderItems: {
          create: salesOrderItems,
        },
      },
      // Include related records in the response (salesOrderItems and transaction)
      include: {
        salesOrderItems: true,
        transaction: true,
      },
    });

    // Update stock and create stock movements
    for (const item of salesOrderItems) {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} not found or inactive`);
      }

      const newStock = product.stock - item.quantity;

      // Create stock movement record
      await tx.stockMovement.create({
        data: {
          type: "SALE",
          productId: item.productId,
          quantity: item.quantity,
          previousStock: product.stock,
          newStock,
          reason: `Sale order #${salesOrder.id}`,
          salesOrderId: salesOrder.id,
        },
      });

      // Update product stock
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: newStock },
      });
    }

    // Return the created sales order with related records
    return salesOrder;
  });
};

const updateSalesOrderFromDatabase = async (salesOrderId: number, salesOrderData: Prisma.SalesOrderUpdateInput) =>
  prisma.salesOrder.update({ where: { id: salesOrderId }, data: salesOrderData });

const deleteSalesOrderFromDatabase = async (salesOrderId: number) =>
  prisma.salesOrder.delete({ where: { id: salesOrderId } });

export {
  getSalesOrdersFromDatabase,
  getSalesOrderByIdFromDatabase,
  postSalesOrderToDatabase,
  updateSalesOrderFromDatabase,
  deleteSalesOrderFromDatabase,
};
