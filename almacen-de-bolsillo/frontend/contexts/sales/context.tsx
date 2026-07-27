import { createContext, useContext, useState, useEffect } from "react";
import { SalesOrderWithItems } from "@/types/Sales-Order";
import { API_URL } from "@/constants/api";

interface SalesContextType {
  sales: SalesOrderWithItems[];
  totalSales: number;
}

export const SalesContext = createContext<SalesContextType | undefined>(undefined);
