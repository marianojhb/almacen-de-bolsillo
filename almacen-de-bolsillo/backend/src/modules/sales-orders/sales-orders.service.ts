import { prisma } from '../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/index.js';

const getSalesOrdersFromDatabase = async () => prisma.salesOrder.findMany();

const getSalesOrderByIdFromDatabase = async (salesOrderId: number) =>
  prisma.salesOrder.findUnique({ where: { id: salesOrderId } });

const postSalesOrderToDatabase = async (salesOrderData: Prisma.SalesOrderCreateInput) =>
  prisma.salesOrder.create({ data: salesOrderData });

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
