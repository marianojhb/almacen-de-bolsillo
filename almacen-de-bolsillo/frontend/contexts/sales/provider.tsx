import { useEffect, useState, useCallback } from "react";
import { SalesContext } from "./context";
import { SalesOrderDto, CreateSalesOrderDto } from "@almacen/shared";
import { getSalesOrdersRequest, createSalesOrderRequest, deleteSalesOrderRequest } from "@/services/salesApi";

interface SalesProviderProps {
  children: React.ReactNode;
}

export function SalesProvider({ children }: SalesProviderProps) {
  const [sales, setSales] = useState<SalesOrderDto[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);

  // State to track loading and error states
  const [isLoadingSales, setIsLoadingSales] = useState<boolean>(false);
  const [errorSaleOrders, setErrorSaleOrders] = useState<string | null>(null);

  const refreshSales = useCallback(async () => {
    try {
      setIsLoadingSales(true);
      setErrorSaleOrders(null);

      const data = await getSalesOrdersRequest();

      setSales(data);
      setTotalSales(data.reduce((accumulator: number, sale: SalesOrderDto) => accumulator + Number(sale.total), 0));
    } catch (error) {
      console.error("Error fetching sales orders with items:", error);
      setErrorSaleOrders("Error fetching sales orders with items");
    } finally {
      setIsLoadingSales(false);
    }
  }, []);

  useEffect(() => {
    void refreshSales();
  }, [refreshSales]);

  async function addSale(sale: CreateSalesOrderDto): Promise<boolean> {
    // Implement the logic to add a sale
    try {
      const newSale = await createSalesOrderRequest(sale);
      setSales((prevSales) => [...prevSales, newSale]);
      setTotalSales((prevTotal) => prevTotal + Number(newSale.total));
      return true;
    } catch (error) {
      console.error("Error creating sales order:", error);
      return false;
    }
  }

  async function deleteSale(saleId: number): Promise<boolean> {
    try {
      await deleteSalesOrderRequest(saleId);
      setSales((prevSales) => prevSales.filter((sale) => sale.id !== saleId));
      return true;
    } catch (error) {
      console.error("Error deleting sales order:", error);
      return false;
    }
  }

  async function clearSales() {
    // Implement the logic to clear all sales
    setSales([]);
    setTotalSales(0);
  }

  return (
    <SalesContext.Provider
      value={{ sales, totalSales, isLoadingSales, errorSaleOrders, addSale, refreshSales, deleteSale, clearSales }}>
      {children}
    </SalesContext.Provider>
  );
}
