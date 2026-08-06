import { createContext } from "react";
import type { NewSupplier, Supplier } from "@/types/Supplier";

interface SuppliersContextType {
  suppliers: Supplier[];
  isLoadingSuppliers: boolean;
  suppliersError: string | null;
  addSupplier: (supplier: NewSupplier) => Promise<boolean>; // booleano, si el proveedor ya existe o no
  updateSupplier: (supplier: Supplier) => Promise<boolean>;
  deleteSupplier: (supplier: Supplier) => Promise<boolean>;
}

export const SuppliersContext = createContext<SuppliersContextType | undefined>(undefined);