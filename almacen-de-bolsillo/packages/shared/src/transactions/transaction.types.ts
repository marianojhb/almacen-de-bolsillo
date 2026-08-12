export type TransactionType = "PURCHASE" | "SALE" | "MANUAL_ENTRY" | "MANUAL_EXIT" | "ADJUSTMENT";

export type Transaction = {
  id: number;
  type: TransactionType;
  productId: number;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdAt: string;
};

export type CreateTransactionDto = Omit<Transaction, "id" | "createdAt">;
