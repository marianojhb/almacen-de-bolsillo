import { prisma } from '../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/index.js';

const getBalancesFromDatabase = async () => prisma.balance.findMany();

const getBalanceByIdFromDatabase = async (balanceId: number) => prisma.balance.findUnique({ where: { id: balanceId } });

const postBalanceToDatabase = async (balanceData: Prisma.BalanceCreateInput) =>
  prisma.balance.create({ data: balanceData });

const updateBalanceFromDatabase = async (balanceId: number, balanceData: Prisma.BalanceUpdateInput) =>
  prisma.balance.update({ where: { id: balanceId }, data: balanceData });

const deleteBalanceFromDatabase = async (balanceId: number) => prisma.balance.delete({ where: { id: balanceId } });

export {
  getBalancesFromDatabase,
  getBalanceByIdFromDatabase,
  postBalanceToDatabase,
  updateBalanceFromDatabase,
  deleteBalanceFromDatabase,
};
