import type { PaymentMethod, WalletProvider } from "./payment-options.js";

export type TransactionType = "PURCHASE" | "SALE" | "MANUAL_ENTRY" | "MANUAL_EXIT" | "ADJUSTMENT";

export type Direction = "INCOME" | "EXPENSE";

export type TransactionDto = {
  id: number;
  date: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  paymentMethod: PaymentMethod;
  walletProvider: WalletProvider | null;
  direction: Direction;
};

export type CreateTransactionDto = Pick<TransactionDto, "amount" | "date" | "paymentMethod" | "walletProvider" | "direction">;
