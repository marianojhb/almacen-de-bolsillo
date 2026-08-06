import { useContext } from "react";
import { SalesDraftContext } from "./context";

export function useSalesDraft() {
  const context = useContext(SalesDraftContext);

  if (!context) {
    throw new Error("useSaleDraft must be used within a SalesDraftProvider");
  }

  return context;
}
