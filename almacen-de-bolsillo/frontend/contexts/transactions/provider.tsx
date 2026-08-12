import { TransactionsContext } from "./context";
import { ReactNode, useState, useEffect, useCallback } from "react";
import { CreateTransactionDto, TransactionDto } from "@almacen/shared";
import { getTransactionsRequest, createTransactionRequest } from "@/services/transactionsApi";

type TransactionsProviderProps = {
  children: ReactNode;
};

export function TransactionsProvider(props: TransactionsProviderProps) {
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);

  const refreshTransactions = useCallback(async () => {
    try {
      const data = await getTransactionsRequest();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, []);

  useEffect(() => {
    void refreshTransactions();
  }, [refreshTransactions]);

  async function createTransaction(transaction: CreateTransactionDto): Promise<void> {
    try {
      const newTransaction = await createTransactionRequest(transaction);
      setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  }

  return (
    <TransactionsContext.Provider value={{ transactions, createTransaction, refreshTransactions }}>
      {props.children}
    </TransactionsContext.Provider>
  );
}
