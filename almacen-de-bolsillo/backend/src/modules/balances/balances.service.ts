import { prisma } from "../config/prisma.js";
import { validateBalance } from "./balances.validation.js";
import { balanceValuesResponse } from "./balances.response.js";

const getBalancesFromDatabase = async (commerceId: number) => {
  const balances = await prisma.balance.findMany({ where: { commerceId }, orderBy: { date: "desc" } });
  return balances.map(balanceValuesResponse);
};

const getBalanceByIdFromDatabase = async (id: number, commerceId: number) => {
  const balance = await prisma.balance.findUnique({ where: { id, commerceId } });
  return balance ? balanceValuesResponse(balance) : null;
};

const postBalanceToDatabase = async (body: unknown, commerceId: number) => {
  const data = validateBalance(body, true);
  const balance = await prisma.balance.create({
    data: {
      commerceId, ...(data.date !== undefined && { date: data.date }),
      opening: data.opening!, cashIn: data.cashIn!, cashOut: data.cashOut!,
      expectedClosing: data.expectedClosing!, actualClosing: data.actualClosing!, difference: data.difference!,
    },
  });
  return balanceValuesResponse(balance);
};

const updateBalanceFromDatabase = async (id: number, body: unknown, commerceId: number) => {
  const balance = await prisma.balance.update({ where: { id, commerceId }, data: validateBalance(body, false) });
  return balanceValuesResponse(balance);
};

const deleteBalanceFromDatabase = async (id: number, commerceId: number) =>
  prisma.balance.delete({ where: { id, commerceId } });

export {
  getBalancesFromDatabase, getBalanceByIdFromDatabase, postBalanceToDatabase,
  updateBalanceFromDatabase, deleteBalanceFromDatabase,
};
