import { useEffect, useState } from "react";
import { SalesContext } from "./context";
import { SalesOrderWithItems } from "@/types/sales-order";
import { getSalesOrdersWithItems, createSalesOrderRequest, deleteSalesOrderRequest } from "@/services/salesApi";

interface SalesProviderProps {
  children: React.ReactNode;
}

export function SalesProvider({ children }: SalesProviderProps) {
  const [totalSales, setTotalSales] = useState<number>(0);
  const [sales, setSales] = useState<SalesOrderWithItems[]>([]);
  const [isLoadingSales, setIsLoadingSales] = useState<boolean>(false);
  const [errorSaleOrdersItems, setErrorSaleOrdersItems] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSales() {
      try {
        setIsLoadingSales(true);
        setErrorSaleOrdersItems(null);
        const salesFetched = await getSalesOrdersWithItems();
        setSales(salesFetched);
        setTotalSales(salesFetched.reduce((acc: number, sale: SalesOrderWithItems) => acc + Number(sale.total), 0));
      } catch (error) {
        console.error("Error fetching sales orders with items:", error);
        setErrorSaleOrdersItems("Error fetching sales orders with items");
      } finally {
        setIsLoadingSales(false);
      }
    }

    fetchSales();
  }, []);

  async function refreshSales() {
    try {
      setIsLoadingSales(true);
      setErrorSaleOrdersItems(null);
      const salesFetched = await getSalesOrdersWithItems();
      setSales(salesFetched);
      setTotalSales(salesFetched.reduce((acc: number, sale: SalesOrderWithItems) => acc + Number(sale.total), 0));
    } catch (error) {
      console.error("Error refreshing sales orders with items:", error);
      setErrorSaleOrdersItems("Error refreshing sales orders with items");
    } finally {
      setIsLoadingSales(false);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      refreshSales();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  async function addSale(sale: Omit<SalesOrderWithItems, "id" | "createdAt">): Promise<boolean> {
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

  return (
    <SalesContext.Provider
      value={{ sales, totalSales, isLoadingSales, errorSaleOrdersItems, addSale, refreshSales, deleteSale }}>
      {children}
    </SalesContext.Provider>
  );
}
