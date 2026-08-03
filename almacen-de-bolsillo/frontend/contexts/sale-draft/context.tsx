import { createContext } from "react";
import type { NewSalesOrderItemDto } from "@almacen/shared";

interface SaleDraftContextType {
  items: NewSalesOrderItemDto[];
  totalAmount: number;
  addItem: (item: NewSalesOrderItemDto) => void;
  removeItem: (productId: number) => void;
  clearSale: () => void;
}
export const SaleDraftContext = createContext<SaleDraftContextType | null>(null);
