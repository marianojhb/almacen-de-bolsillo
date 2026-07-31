import { createContext } from "react";
import type { SaleItem } from "@/types/sale-item";

type SaleDraftContextType = {
  items: SaleItem[];
  totalAmount: number;
  addItem: (item: SaleItem) => void;
  removeItem: (productId: number) => void;
  clearSale: () => void;
};

export const SaleDraftContext = createContext<SaleDraftContextType | null>(null);
