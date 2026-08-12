import { useContext } from "react";

import { TransactionsContext } from "./context";

export function useTransactions() {
  const context = useContext(TransactionsContext);

  if (!context) {
    throw new Error(
      "useTransactions debe utilizarse dentro de TransactionsProvider.",
    );
  }

  return context;
}