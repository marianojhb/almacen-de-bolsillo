import type { CreateSupplierDto, Supplier, UpdateSupplierDto } from "@almacen/shared";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import { SuppliersContext } from "./context";
import { createSupplierRequest, deleteSupplierRequest, getSuppliers, updateSupplierRequest } from "@/services/suppliersApi";

type Props = {
  children: ReactNode;
};

const sortSuppliers = (suppliers: Supplier[]) =>
  [...suppliers].sort((first, second) =>
    first.name.localeCompare(
      second.name,
      "es",
    ),
  );

export function SuppliersProvider({children,}: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [ isLoadingSuppliers, setIsLoadingSuppliers ] = useState(true);

  const [ suppliersError, setSuppliersError ] = useState<string | null>(null);

  const refreshSuppliers = useCallback(async () => {
      try {
        setIsLoadingSuppliers(true);
        setSuppliersError(null);

        const response =
          await getSuppliers();

        setSuppliers(
          sortSuppliers(response),
        );
      } catch (error) {
        console.error(
          "Error loading suppliers:",
          error,
        );

        setSuppliersError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los proveedores.",
        );
      } finally {
        setIsLoadingSuppliers(false);
      }
  }, []);

  useEffect(() => {
    void refreshSuppliers();
  }, [refreshSuppliers]);

  const addSupplier = async (supplierData: CreateSupplierDto) => {
    const supplier = await createSupplierRequest(supplierData);

    setSuppliers((current) =>
      sortSuppliers([
        ...current,
        supplier,
      ]),
    );

    return supplier;
  };

  const updateSupplier = async (supplierId: number, supplierData: UpdateSupplierDto) => {
    const supplier = await updateSupplierRequest(supplierId, supplierData);

    setSuppliers((current) =>
      sortSuppliers(
        current.map((item) =>
          item.id === supplier.id
            ? supplier
            : item,
        ),
      ),
    );

    return supplier;
  };

const deleteSupplier = async (supplierId: number) => {
  await deleteSupplierRequest(supplierId);

  setSuppliers((current) =>
    current.map((supplier) =>
      supplier.id === supplierId
        ? {
            ...supplier,
            isActive: false,
          }
        : supplier,
    ),
  );
};

  return (
    <SuppliersContext.Provider
      value={{
        suppliers,
        isLoadingSuppliers,
        suppliersError,
        refreshSuppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
      }}
    >
      {children}
    </SuppliersContext.Provider>
  );
}