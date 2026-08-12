import { createContext } from "react";
import { CreateTransactionDto, TransactionDto } from "@almacen/shared";

interface TransactionsContextType {
  transactions: TransactionDto[];
  createTransaction: (transaction: CreateTransactionDto) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

export const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);