import { prisma } from '../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/index.js';

const getTransactionsFromDatabase = async () => prisma.transaction.findMany();

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
