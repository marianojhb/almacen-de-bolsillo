import { createContext } from "react";
import type { NewSalesOrderItem } from "@/types/sales-order";

interface SaleDraftContextType {
  items: NewSalesOrderItem[];
  totalAmount: number;
  addItem: (item: NewSalesOrderItem) => void;
  removeItem: (productId: number) => void;
  clearSale: () => void;
}
export const SaleDraftContext = createContext<SaleDraftContextType | null>(null);
