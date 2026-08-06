import { createContext } from "react";
import { CreateSalesOrderItemDto, SalesOrderWithItemsDto } from "@almacen/shared";

interface SalesContextType {
  sales: SalesOrderWithItemsDto[];
  totalSales: number;
  isLoadingSales: boolean;
  errorSaleOrdersItems: string | null;
  addSale: (sale: CreateSalesOrderItemDto) => Promise<boolean>;
  deleteSale: (saleId: number) => Promise<boolean>;
  refreshSales: () => Promise<void>;
}

export const SalesContext = createContext<SalesContextType | undefined>(undefined);
