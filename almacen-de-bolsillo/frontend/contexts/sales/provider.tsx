import { useEffect, useState } from "react";
import { SalesContext } from "./context";
import { SalesOrder, SalesOrderWithItems } from "@/types/Sales-Order";

interface SalesProviderProps {
  children: React.ReactNode;
}

export function SalesProvider({ children }: SalesProviderProps) {
  const [totalSales, setTotalSales] = useState<number>(0);
  const [sales, setSales] = useState<SalesOrderWithItems[]>([]);

  useEffect(() => {
    async function fetchSales() {
      const salesFetched = await fetch("http://192.168.0.158:3000/sales-orders/");
      const data = await salesFetched.json();
      setSales(data);
      setTotalSales(data.reduce((acc: number, sale: SalesOrderWithItems) => acc + Number(sale.total), 0));
    }
    fetchSales();
  }, []);

  return <SalesContext.Provider value={{ sales, totalSales }}>{children}</SalesContext.Provider>;
}
