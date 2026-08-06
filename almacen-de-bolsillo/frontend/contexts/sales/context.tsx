import { createContext } from "react";
import { SalesOrderDto, CreateSalesOrderDto } from "@almacen/shared";

interface SalesContextType {
  sales: SalesOrderDto[];
  totalSales: number;
  isLoadingSales: boolean;
  errorSaleOrdersItems: string | null;
  addSale: (sale: CreateSalesOrderDto) => Promise<boolean>;
  deleteSale: (saleId: number) => Promise<boolean>;
  refreshSales: () => Promise<void>;
}

export const SalesContext = createContext<SalesContextType | undefined>(undefined);
