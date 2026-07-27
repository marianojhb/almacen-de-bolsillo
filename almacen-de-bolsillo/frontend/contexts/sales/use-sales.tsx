import { useContext } from "react";
import { SalesContext } from "@/contexts/sales/context";

export function useSales() {
  const context = useContext(SalesContext);

  if (!context) {
    throw new Error("useSales debe utilizarse dentro de SalesProvider");
  }

  return context;
}
