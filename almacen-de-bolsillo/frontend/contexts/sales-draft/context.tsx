import { createContext } from "react";
import type { CreateSalesOrderItemDto } from "@almacen/shared";

interface SalesDraftContextType {
  items: CreateSalesOrderItemDto[];
  totalAmount: number;
  addItem: (item: CreateSalesOrderItemDto) => void;
  removeItem: (productId: number) => void;
  clearSales: () => void;
}
export const SalesDraftContext = createContext<SalesDraftContextType | null>(null);
