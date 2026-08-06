import { useEffect, useState, ReactNode } from "react";
import { SuppliersContext } from "@/contexts/suppliers/context";
import type { Supplier, NewSupplier } from "@/types/Supplier";
import { getSuppliers, createSupplierRequest, updateSupplierRequest } from "@/services/suppliersApi";

type Props = {
  children: ReactNode;
};

export function SuppliersProvider({ children }: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  
    useEffect(() => {
      // Obtener los proveedores desde la API y actualizar el estado
      const fetchSuppliers = async () => {
        try {
          setIsLoadingSuppliers(true);
          setSuppliers(await getSuppliers());
          setSuppliersError(null);
        } catch (error) {
          console.error(error);

          setSuppliersError("Error cargando proveedores");
        } finally {
          setIsLoadingSuppliers(false);
        }
      };
  
      fetchSuppliers();

      // Actualizar el estado y el fetch con los proveedores obtenidos desde la API
    }, []);
  

  async function addSupplier(newSupplier: NewSupplier): Promise<boolean> {
    try {
      const createdSupplier = await createSupplierRequest(newSupplier);
      setSuppliers((current) => [...current, createdSupplier]);

      return true;
    } catch (error) {
      console.error("Error creating supplier:", error);

      return false;
    }
  }

  async function updateSupplier(updatedSupplier: Supplier): Promise<boolean> {
    try {
      const supplier = await updateSupplierRequest(updatedSupplier.id, updatedSupplier);

      setSuppliers((current) =>
        current.map((item) =>
          item.id === supplier.id ? supplier : item,
        ),
      );

      return true;
    } catch (error) {
      console.error("Error updating supplier:", error);

      return false;
    }
  }

  async function deleteSupplier(updatedSupplier: Supplier): Promise<boolean> {
    try {
      setSuppliers((current) =>
        current.map((item) =>
          item.id === updatedSupplier.id ? updatedSupplier : item,
        ),
      );

      return true;
    } catch (error) {
      console.error("Error deleting supplier:", error);

      return false;
    }
  }

  return (
    <SuppliersContext.Provider
      value={{ 
        suppliers, 
        isLoadingSuppliers, 
        suppliersError, 
        addSupplier, 
        updateSupplier, 
        deleteSupplier, 
      }}>
      {children}
    </SuppliersContext.Provider>
  );
}