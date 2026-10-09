import { usePermissions } from "@/hooks/use-permissions";
import { useRef, useEffect, useState, useCallback } from "react";
import { SalesContext } from "./context";
import { SalesOrderDto, CreateSalesOrderDto } from "@almacen/shared";
import { getSalesOrdersRequest, createSalesOrderRequest, deleteSalesOrderRequest } from "@/services/salesApi";

interface SalesProviderProps {
  children: React.ReactNode;
}

export function SalesProvider({ children }: SalesProviderProps) {
  const { can } = usePermissions();
  const [sales, setSales] = useState<SalesOrderDto[]>([]);
  const totalSales = sales.reduce((total, sale) => total + Number(sale.total), 0);
  const [isLoadingSales, setIsLoadingSales] = useState<boolean>(false);
  const [errorSaleOrders, setErrorSaleOrders] = useState<string | null>(null);

  const refreshSalesRequest = useRef<Promise<void> | null>(null);
  const refreshSales = useCallback(async () => {
    if (refreshSalesRequest.current) return refreshSalesRequest.current;
    async function load() {
      if (!can("sales.read")) { setSales([]); setErrorSaleOrders(null); setIsLoadingSales(false); return; }
      try {
        setIsLoadingSales(true);
        setErrorSaleOrders(null);
  
        const data = await getSalesOrdersRequest();
  
        setSales(data);
      } catch (error) {
        console.error("Error fetching sales orders with items:", error);
        setErrorSaleOrders("Error fetching sales orders with items");
      } finally {
        setIsLoadingSales(false);
      }
    }

    const request = load();
    refreshSalesRequest.current = request;
    return request.finally(() => {
      if (refreshSalesRequest.current === request) {
        refreshSalesRequest.current = null;
      }
    });
  }, [can]);

  useEffect(() => {
    void refreshSales();
  }, [refreshSales]);

  async function addSale(sale: CreateSalesOrderDto): Promise<boolean> {
    if (!can("sales.create")) return false;
    const newSale = await createSalesOrderRequest(sale);
    setSales((prevSales) => [...prevSales, newSale]);
    return true;

  }

  async function deleteSale(saleId: number): Promise<boolean> {
    if (!can("sales.delete")) return false;
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
    setSales([]);
  }

  return (
    <SalesContext.Provider
      value={{ sales, totalSales, isLoadingSales, errorSaleOrders, addSale, refreshSales, deleteSale, clearSales }}>
      {children}
    </SalesContext.Provider>
  );
}
