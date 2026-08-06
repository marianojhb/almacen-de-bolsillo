import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

const getPurchaseOrdersItemsFromDatabase = async () => prisma.purchaseOrdersItem.findMany();

const getPurchaseOrderItemByIdFromDatabase = async (productId: number, purchaseOrderId: number) =>
  prisma.purchaseOrdersItem.findUnique({
    where: {
      productId_purchaseOrderId: {
        productId,
        purchaseOrderId,
      },
    },
  });

const postPurchaseOrderItemToDatabase = async (purchaseOrderItemData: Prisma.PurchaseOrdersItemUncheckedCreateInput) =>
  prisma.purchaseOrdersItem.create({ data: purchaseOrderItemData });

const updatePurchaseOrderItemFromDatabase = async (
  productId: number,
  purchaseOrderId: number,
  purchaseOrderItemData: Prisma.PurchaseOrdersItemUpdateInput,
) =>
  prisma.purchaseOrdersItem.update({
    where: {
      productId_purchaseOrderId: {
        productId,
        purchaseOrderId,
      },
    },
    data: purchaseOrderItemData,
  });

const deletePurchaseOrderItemFromDatabase = async (productId: number, purchaseOrderId: number) =>
  prisma.purchaseOrdersItem.delete({
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
