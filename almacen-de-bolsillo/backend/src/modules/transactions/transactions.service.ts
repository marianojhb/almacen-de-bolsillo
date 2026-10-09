import type { PaymentMethod, WalletProvider } from "@almacen/shared";
import { readAmount } from "../products/order.validation.js";
import { prisma } from "../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";
import {
  ApiError, readBody, readDate, readPayment,
} from "../auth/request.utils.js";

type TransactionData = { amount?: number; date?: Date; direction?: "INCOME" | "EXPENSE"; paymentMethod?: PaymentMethod; walletProvider?: WalletProvider | null };

const validateTransaction = (body: unknown, creating: boolean): TransactionData => {
  const source = readBody(body, ["amount", "date", "direction", "paymentMethod", "walletProvider"]);
  const data: TransactionData = {};
  if (source.amount !== undefined) data.amount = readAmount(source.amount, "amount");
  else if (creating) throw new ApiError(400, "El importe es obligatorio.");
  if (source.date !== undefined) data.date = readDate(source.date);
  if (source.paymentMethod !== undefined) Object.assign(data, readPayment(source.paymentMethod, source.walletProvider));
  else if (creating || source.walletProvider !== undefined) throw new ApiError(400, "Indicá el medio de pago junto a la billetera, si corresponde.");
  if (source.direction !== undefined) {
    if (source.direction !== "INCOME" && source.direction !== "EXPENSE") {
      throw new ApiError(400, "La dirección de la transacción no es válida.");
    }
    data.direction = source.direction;
  } else if (creating) throw new ApiError(400, "La dirección es obligatoria.");
  return data;
};

const transactionResponse = <T extends { amount: { toString(): string } }>(record: T) => ({ ...record, amount: Number(record.amount) });

const getTransactionsFromDatabase = async (commerceId: number, from?: unknown, to?: unknown) => {
  const date: Prisma.DateTimeFilter = {};
  const start = from === undefined ? undefined : readDate(from);
  const end = to === undefined ? undefined : readDate(to);
  if (start && end && start > end) throw new ApiError(400, "El rango de fechas no es válido.");
  if (start) date.gte = start;
  if (end) {
    end.setUTCDate(end.getUTCDate() + 1);
    date.lt = end;
  }
  return prisma.transaction.findMany({ where: { commerceId, ...(start || end ? { date } : {}) }, orderBy: { date: "desc" } }).then((records) => records.map(transactionResponse));
};

const getTransactionByIdFromDatabase = async (id: number, commerceId: number) =>
  prisma.transaction.findUnique({ where: { id, commerceId } }).then((record) => record ? transactionResponse(record) : null);

const postTransactionToDatabase = async (body: unknown, commerceId: number) => {
  const data = validateTransaction(body, true);
  return prisma.transaction.create({ data: { ...data, amount: data.amount!, direction: data.direction!, paymentMethod: data.paymentMethod!, commerceId } }).then(transactionResponse);
};

const updateTransactionFromDatabase = async (id: number, body: unknown, commerceId: number) =>
  prisma.$transaction(async (tx) => {
    const data = validateTransaction(body, false);
    const transaction = await tx.transaction.findUniqueOrThrow({
      where: { id, commerceId },
      select: { salesOrder: { select: { id: true } }, purchaseOrder: { select: { id: true } } },
    });
    if (transaction.salesOrder || transaction.purchaseOrder) {
      throw new ApiError(409, "Una transacción vinculada a una compra o venta no puede modificarse por separado.");
    }
    return tx.transaction.update({ where: { id, commerceId }, data }).then(transactionResponse);
  });

const deleteTransactionFromDatabase = async (id: number, commerceId: number) =>
  prisma.transaction.delete({ where: { id, commerceId } });

export {
  getTransactionsFromDatabase, getTransactionByIdFromDatabase, postTransactionToDatabase,
  updateTransactionFromDatabase, deleteTransactionFromDatabase,
};
