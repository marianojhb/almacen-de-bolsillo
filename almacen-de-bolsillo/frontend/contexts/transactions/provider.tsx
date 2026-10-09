import { usePermissions } from "@/hooks/use-permissions";
import { TransactionsContext } from "./context";
import { useRef, ReactNode, useState, useEffect, useCallback } from "react";
import { CreateTransactionDto, TransactionDto } from "@almacen/shared";
import { getTransactionsRequest, createTransactionRequest } from "@/services/transactionsApi";

type TransactionsProviderProps = {
  children: ReactNode;
};

export function TransactionsProvider(props: TransactionsProviderProps) {
  const { can } = usePermissions();
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const refreshTransactionsRequest = useRef<Promise<void> | null>(null);
  const refreshTransactions = useCallback(async () => {
    if (refreshTransactionsRequest.current) return refreshTransactionsRequest.current;
    async function load() {
      if (!can("transactions.read")) { setTransactions([]); setTransactionsError(null); setIsLoadingTransactions(false); return; }
      try {
        setTransactionsError(null);
        setIsLoadingTransactions(true);
        const data = await getTransactionsRequest();
        setTransactions(data);
      } catch (error) {
        setTransactionsError("Error fetching transactions");
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoadingTransactions(false);
      }
    }

    const request = load();
    refreshTransactionsRequest.current = request;
    return request.finally(() => {
      if (refreshTransactionsRequest.current === request) {
        refreshTransactionsRequest.current = null;
      }
    });
  }, [can]);

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
    <TransactionsContext.Provider
      value={{ transactions, isLoadingTransactions, transactionsError, createTransaction, refreshTransactions }}>
      {props.children}
    </TransactionsContext.Provider>
  );
}
