import { prisma } from '../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/index.js';

const getPurchaseOrdersItemsFromDatabase = async () => prisma.purchaseOrdersItems.findMany();

const getPurchaseOrderItemByIdFromDatabase = async (productId: number, purchaseOrderId: number) =>
  prisma.purchaseOrdersItems.findUnique({
    where: {
      productId_purchaseOrderId: {
        productId,
        purchaseOrderId,
      },
    },
  });

const postPurchaseOrderItemToDatabase = async (purchaseOrderItemData: Prisma.PurchaseOrdersItemsUncheckedCreateInput) =>
  prisma.purchaseOrdersItems.create({ data: purchaseOrderItemData });

const updatePurchaseOrderItemFromDatabase = async (
  productId: number,
  purchaseOrderId: number,
  purchaseOrderItemData: Prisma.PurchaseOrdersItemsUpdateInput,
) =>
  prisma.purchaseOrdersItems.update({
    where: {
      productId_purchaseOrderId: {
        productId,
        purchaseOrderId,
      },
    },
    data: purchaseOrderItemData,
  });

const deletePurchaseOrderItemFromDatabase = async (productId: number, purchaseOrderId: number) =>
  prisma.purchaseOrdersItems.delete({
    where: {
      productId_purchaseOrderId: {
        productId,
        purchaseOrderId,
      },
    },
  });

export {
  getPurchaseOrdersItemsFromDatabase,
  getPurchaseOrderItemByIdFromDatabase,
  postPurchaseOrderItemToDatabase,
  updatePurchaseOrderItemFromDatabase,
  deletePurchaseOrderItemFromDatabase,
};
