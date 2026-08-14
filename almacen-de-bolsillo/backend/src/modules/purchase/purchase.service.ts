import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

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

const postPurchaseOrderToDatabase = async (purchaseOrderData: Prisma.PurchaseOrderCreateInput) =>
  prisma.purchaseOrder.create({ data: purchaseOrderData });

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
