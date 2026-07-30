import { createContext } from "react";
import type { SaleItem } from "@/types/sale-item";

export interface SalesDraftItem {
  productId: number;
  shortname: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
}

type SaleDraftContextType = {
  items: SaleItem[];
  addItem: (item: SaleItem) => void;
  removeItem: (productId: number) => void;
  clearSale: () => void;
};

export const SaleDraftContext = createContext<SaleDraftContextType | null>(null);
