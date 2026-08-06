import { useContext } from "react";
import { PurchaseDraftContext } from "./context";

export function usePurchaseDraft() {
  const context = useContext(PurchaseDraftContext);

  if (!context) {
    throw new Error("usePurchaseDraft must be used within a PurchaseDraftProvider");
  }

  return context;
}
