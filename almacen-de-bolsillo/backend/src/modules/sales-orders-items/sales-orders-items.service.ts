import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

const getSalesOrderItemsFromDatabase = async () => prisma.salesOrderItem.findMany();

const getSalesOrderItemByIdFromDatabase = async (salesOrderItemId: number, productId: number) =>
  prisma.salesOrderItem.findUnique({
    where: {
      salesOrderItemId_productId: {
        salesOrderItemId,
        productId,
      },
    },
  });

const postSalesOrderItemToDatabase = async (salesOrderItemData: Prisma.SalesOrderItemUncheckedCreateInput) =>
  prisma.salesOrderItem.create({ data: salesOrderItemData });

const updateSalesOrderItemFromDatabase = async (
  salesOrderItemId: number,
  productId: number,
  salesOrderItemData: Prisma.SalesOrderItemUpdateInput,
) =>
  prisma.salesOrderItem.update({
    where: {
      salesOrderItemId_productId: {
        salesOrderItemId,
        productId,
      },
    },
    data: salesOrderItemData,
  });

const deleteSalesOrderItemFromDatabase = async (salesOrderItemId: number, productId: number) =>
  prisma.salesOrderItem.delete({
    where: {
      salesOrderItemId_productId: {
        salesOrderItemId,
        productId,
      },
    },
  });

export {
  getSalesOrderItemsFromDatabase,
  getSalesOrderItemByIdFromDatabase,
  postSalesOrderItemToDatabase,
  updateSalesOrderItemFromDatabase,
  deleteSalesOrderItemFromDatabase,
};
