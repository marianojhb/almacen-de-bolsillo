import { prisma } from '../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/index.js';

const getSalesOrdersItemsFromDatabase = async () => prisma.salesOrdersItems.findMany();

const getSalesOrderItemByIdFromDatabase = async (salesOrdersItemId: number, productId: number) =>
  prisma.salesOrdersItems.findUnique({
    where: {
      salesOrdersItemId_productId: {
        salesOrdersItemId,
        productId,
      },
    },
  });

const postSalesOrderItemToDatabase = async (salesOrderItemData: Prisma.SalesOrdersItemsUncheckedCreateInput) =>
  prisma.salesOrdersItems.create({ data: salesOrderItemData });

const updateSalesOrderItemFromDatabase = async (
  salesOrdersItemId: number,
  productId: number,
  salesOrderItemData: Prisma.SalesOrdersItemsUpdateInput,
) =>
  prisma.salesOrdersItems.update({
    where: {
      salesOrdersItemId_productId: {
        salesOrdersItemId,
        productId,
      },
    },
    data: salesOrderItemData,
  });

const deleteSalesOrderItemFromDatabase = async (salesOrdersItemId: number, productId: number) =>
  prisma.salesOrdersItems.delete({
    where: {
      salesOrdersItemId_productId: {
        salesOrdersItemId,
        productId,
      },
    },
  });

export {
  getSalesOrdersItemsFromDatabase,
  getSalesOrderItemByIdFromDatabase,
  postSalesOrderItemToDatabase,
  updateSalesOrderItemFromDatabase,
  deleteSalesOrderItemFromDatabase,
};
