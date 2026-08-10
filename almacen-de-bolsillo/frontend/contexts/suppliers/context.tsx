import type { CreateSupplierDto, Supplier, UpdateSupplierDto } from "@almacen/shared";
import { createContext } from "react";

interface SuppliersContextType {
  suppliers: Supplier[]; 
  isLoadingSuppliers: boolean;
  suppliersError: string | null;
  refreshSuppliers: () => Promise<void>;
  addSupplier: (supplier: CreateSupplierDto) => Promise<Supplier>;
  updateSupplier: (supplierId: number, supplier: UpdateSupplierDto) => Promise<Supplier>;
  deleteSupplier: (supplierId: number) => Promise<void>;
}

export const SuppliersContext =
  createContext<SuppliersContextType | undefined>(undefined);