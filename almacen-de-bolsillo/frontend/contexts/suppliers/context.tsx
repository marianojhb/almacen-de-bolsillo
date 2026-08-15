import type { CreateSupplierDto, SupplierWithRelations, UpdateSupplierDto } from "@almacen/shared";
import { createContext } from "react";

interface SuppliersContextType {
  suppliers: SupplierWithRelations[]; 
  isLoadingSuppliers: boolean;
  suppliersError: string | null;
  refreshSuppliers: () => Promise<void>;
  addSupplier: (supplier: CreateSupplierDto) => Promise<SupplierWithRelations>;
  updateSupplier: (supplierId: number, supplier: UpdateSupplierDto) => Promise<SupplierWithRelations>;
  deleteSupplier: (supplierId: number) => Promise<void>;
}

export const SuppliersContext = createContext<SuppliersContextType | undefined>(undefined);