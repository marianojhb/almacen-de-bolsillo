import { createContext } from "react";
import { NewSalesOrderWithItems, SalesOrderWithItems } from "@/types/sales-order";

interface SalesContextType {
  sales: SalesOrderWithItems[];
  totalSales: number;
  isLoadingSales: boolean;
  errorSaleOrdersItems: string | null;
  addSale: (sale: NewSalesOrderWithItems) => Promise<boolean>;
  deleteSale: (saleId: number) => Promise<boolean>;
  refreshSales: () => Promise<void>;
}

export const SalesContext = createContext<SalesContextType | undefined>(undefined);
