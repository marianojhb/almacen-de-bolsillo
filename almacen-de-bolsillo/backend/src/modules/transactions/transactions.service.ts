import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

const getTransactionsFromDatabase = async (from?: string, to?: string) => {
  const dateFilter: Prisma.DateTimeFilter = {};
  if (from) {
    dateFilter.gte = new Date(from);
  }

  if (to) {
    const nextDay = new Date(to);
    nextDay.setDate(nextDay.getDate() + 1);
    dateFilter.lt = nextDay;
  }

  const where: Prisma.TransactionWhereInput = {};

  if (from || to) {
    where.date = dateFilter;
  }
  return prisma.transaction.findMany({ where });
};

const getTransactionByIdFromDatabase = async (transactionId: number) =>
  prisma.transaction.findUnique({ where: { id: transactionId } });

const postTransactionToDatabase = async (transactionData: Prisma.TransactionCreateInput) =>
  prisma.transaction.create({ data: transactionData });

const updateTransactionFromDatabase = async (transactionId: number, transactionData: Prisma.TransactionUpdateInput) =>
  prisma.transaction.update({ where: { id: transactionId }, data: transactionData });

const deleteTransactionFromDatabase = async (transactionId: number) =>
  prisma.transaction.delete({ where: { id: transactionId } });

export {
  getTransactionsFromDatabase,
  getTransactionByIdFromDatabase,
  postTransactionToDatabase,
  updateTransactionFromDatabase,
  deleteTransactionFromDatabase,
};
