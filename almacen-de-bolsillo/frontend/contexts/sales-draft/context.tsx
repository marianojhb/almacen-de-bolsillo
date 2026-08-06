import { createContext } from "react";
import type { NewSalesOrderItemDto } from "@almacen/shared";

interface SalesDraftContextType {
  items: NewSalesOrderItemDto[];
  totalAmount: number;
  addItem: (item: NewSalesOrderItemDto) => void;
  removeItem: (productId: number) => void;
  clearSales: () => void;
}
export const SalesDraftContext = createContext<SalesDraftContextType | null>(null);
