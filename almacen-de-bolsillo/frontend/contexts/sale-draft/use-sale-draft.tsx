import { useContext } from "react";
import { SaleDraftContext } from "./context";

export function useSaleDraft() {
  const context = useContext(SaleDraftContext);

  if (!context) {
    throw new Error("useSaleDraft must be used within a SalesDraftProvider");
  }

  return context;
}
