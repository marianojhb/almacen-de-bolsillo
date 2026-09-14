import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";
import type { CreatePurchaseOrderDto } from "@almacen/shared";

const getPurchaseOrdersFromDatabase = async () =>
  prisma.purchaseOrder.findMany({
    include: {
      supplier: true,
      purchaseOrdersItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

const getPurchaseOrderByIdFromDatabase = async (purchaseOrderId: number) =>
  prisma.purchaseOrder.findUnique({
    where: {
      id: purchaseOrderId,
    },
    include: {
      supplier: true,
      purchaseOrdersItems: {
        include: {
          product: true,
        },
      },
    },
  });

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const postPurchaseOrderToDatabase = async (purchaseOrderData: CreatePurchaseOrderDto) => {
  const { items, supplierId, userId } = purchaseOrderData;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("A purchase order must contain at least one item");
  }

  if (!Number.isInteger(supplierId) || supplierId <= 0) {
    throw new Error("A valid supplier is required");
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("A valid user is required");
  }

  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const price = Number(item.price);
    const discount = Number(item.discount ?? 0);

    if (!Number.isInteger(item.productId) || item.productId <= 0) {
      throw new Error("Every purchase item must have a valid product");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Quantity for product ${item.productId} must be a positive integer`);
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Price for product ${item.productId} must be zero or greater`);
    }

    if (!Number.isFinite(discount) || discount < 0) {
      throw new Error(`Discount for product ${item.productId} must be zero or greater`);
    }

    return {
      productId: item.productId,
      quantity,
      price: roundCurrency(price),
      discount: roundCurrency(discount),
      subtotal: roundCurrency(Math.max(0, quantity * price - discount)),
    };
  });

  const productIds = normalizedItems.map((item) => item.productId);

  if (new Set(productIds).size !== productIds.length) {
    throw new Error("A product cannot be repeated in the same purchase order");
  }

  const total = roundCurrency(normalizedItems.reduce((orderTotal, item) => orderTotal + item.subtotal, 0));

  return prisma.$transaction(async (tx) => {
    const supplierProducts = await tx.productOnSupplier.findMany({
      where: {
        supplierId,
        productId: { in: productIds },
        product: { isActive: true },
      },
      select: { productId: true },
    });
    const availableProductIds = new Set(supplierProducts.map((supplierProduct) => supplierProduct.productId));
    const unavailableProductId = productIds.find((productId) => !availableProductIds.has(productId));

    if (unavailableProductId !== undefined) {
      throw new Error(`Product ${unavailableProductId} is inactive or unavailable from supplier ${supplierId}`);
    }

    const purchaseOrder = await tx.purchaseOrder.create({
      data: {
        total,
        supplier: { connect: { id: supplierId } },
        buyer: { connect: { id: userId } },
        transaction: {
          create: {
            amount: total,
            direction: "EXPENSE",
          },
        },
        purchaseOrdersItems: {
          create: normalizedItems,
        },
      },
      include: {
        supplier: true,
        purchaseOrdersItems: {
          include: { product: true },
        },
        transaction: true,
      },
    });

    for (const item of normalizedItems) {
      const updatedProduct = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
        select: { stock: true },
      });
      const previousStock = updatedProduct.stock - item.quantity;

      await tx.stockMovement.create({
        data: {
          type: "PURCHASE",
          productId: item.productId,
          quantity: item.quantity,
          previousStock,
          newStock: updatedProduct.stock,
          reason: `Purchase order #${purchaseOrder.id}`,
          purchaseOrderId: purchaseOrder.id,
        },
      });
    }

    return purchaseOrder;
  });
};

const updatePurchaseOrderFromDatabase = async (
  purchaseOrderId: number,
  purchaseOrderData: Prisma.PurchaseOrderUpdateInput,
) => prisma.purchaseOrder.update({ where: { id: purchaseOrderId }, data: purchaseOrderData });
const deletePurchaseOrderFromDatabase = async (purchaseOrderId: number) =>
  prisma.purchaseOrder.delete({ where: { id: purchaseOrderId } });

export {
  getPurchaseOrdersFromDatabase,
  getPurchaseOrderByIdFromDatabase,
  postPurchaseOrderToDatabase,
  updatePurchaseOrderFromDatabase,
  deletePurchaseOrderFromDatabase,
};
