import { createContext } from "react";
import type { SalesDraftItem } from "@almacen/shared";

interface SalesDraftContextType {
  items: SalesDraftItem[];
  totalAmount: number;
  addItem: (item: SalesDraftItem) => void;
  removeItem: (productId: number) => void;
  clearSales: () => void;
}
export const SalesDraftContext = createContext<SalesDraftContextType | undefined>(undefined);
