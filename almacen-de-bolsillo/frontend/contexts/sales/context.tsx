import { createContext } from "react";
import { NewSalesOrderWithItemsDto, SalesOrderWithItemsDto } from "@almacen/shared";

interface SalesContextType {
  sales: SalesOrderWithItemsDto[];
  totalSales: number;
  isLoadingSales: boolean;
  errorSaleOrdersItems: string | null;
  addSale: (sale: NewSalesOrderWithItemsDto) => Promise<boolean>;
  deleteSale: (saleId: number) => Promise<boolean>;
  refreshSales: () => Promise<void>;
}

export const SalesContext = createContext<SalesContextType | undefined>(undefined);
