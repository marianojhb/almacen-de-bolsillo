import { prisma } from "@/config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";
import type { NewSalesOrderWithItemsDto } from "@almacen/shared";

const salesOrderWithItemsQuery = {
  include: {
    salesOrdersItems: {
      include: {
        product: {
          select: {
            id: true,
            shortname: true,
            longname: true,
            price: true,
            stock: true,
            isActive: true,
          },
        },
      },
    },
  },
} satisfies Prisma.SalesOrderDefaultArgs;

const getSalesOrdersFromDatabase = async () => prisma.salesOrder.findMany();

const getSalesOrdersWithItemsFromDatabase = async () =>
  prisma.salesOrder.findMany({ ...salesOrderWithItemsQuery, orderBy: { createdAt: "desc" } });

const getSalesOrderByIdFromDatabase = async (salesOrderId: number) =>
  prisma.salesOrder.findUnique({ where: { id: salesOrderId } });

const postSalesOrderToDatabase = async (salesOrderData: NewSalesOrderWithItemsDto) => {
  const { salesOrdersItems, ...newSalesOrders } = salesOrderData;
  return prisma.salesOrder.create({
    data: { ...newSalesOrders, salesOrdersItems: { create: salesOrdersItems } },
    include: { salesOrdersItems: true },
  });
};

const updateSalesOrderFromDatabase = async (salesOrderId: number, salesOrderData: Prisma.SalesOrderUpdateInput) =>
  prisma.salesOrder.update({ where: { id: salesOrderId }, data: salesOrderData });

const deleteSalesOrderFromDatabase = async (salesOrderId: number) =>
  prisma.salesOrder.delete({ where: { id: salesOrderId } });

export {
  getSalesOrdersFromDatabase,
  getSalesOrdersWithItemsFromDatabase,
  getSalesOrderByIdFromDatabase,
  postSalesOrderToDatabase,
  updateSalesOrderFromDatabase,
  deleteSalesOrderFromDatabase,
};
