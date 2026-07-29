import { createContext } from "react";
import { SalesOrderWithItems } from "@/types/Sales-Order";

interface SalesContextType {
  sales: SalesOrderWithItems[];
  totalSales: number;
  isLoadingSales: boolean;
  errorSaleOrdersItems: string | null;
  addSale: (sale: Omit<SalesOrderWithItems, "id" | "createdAt">) => Promise<boolean>;
  deleteSale: (saleId: number) => Promise<boolean>;
  refreshSales: () => Promise<void>;
}

export const SalesContext = createContext<SalesContextType | undefined>(undefined);
