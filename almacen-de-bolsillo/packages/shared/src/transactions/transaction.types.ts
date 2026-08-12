import type { PaymentMethod } from "@almacen/shared";

export type TransactionType = "PURCHASE" | "SALE" | "MANUAL_ENTRY" | "MANUAL_EXIT" | "ADJUSTMENT";

export type Direction = "INCOME" | "EXPENSE";

export type TransactionDto = {
  id: number;
  date: string;
  amount: number;
  type: TransactionType;
  createdAt: string;
  updatedAt: string;
  paymentMethod: PaymentMethod;
  salesOrders: number[];
  purchaseOrders: number[];
  direction: Direction;
};

export type CreateTransactionDto = Omit<TransactionDto, "id" | "createdAt">;
