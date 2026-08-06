import { useContext } from "react";
import { SuppliersContext } from "@/contexts/suppliers/context";

export function useSuppliers() {
  const context = useContext(SuppliersContext);

  if (!context) {
    throw new Error("useSuppliers debe utilizarse dentro de SuppliersProvider",);
  }

  return context;
}