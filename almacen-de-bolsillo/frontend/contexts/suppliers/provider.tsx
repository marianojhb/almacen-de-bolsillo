import { usePermissions } from "@/hooks/use-permissions";
import type { CreateSupplierDto, SupplierWithRelations, UpdateSupplierDto } from "@almacen/shared";
import { useRef, type ReactNode, useCallback, useEffect, useState } from "react";

import { SuppliersContext } from "./context";
import { createSupplierRequest, deleteSupplierRequest, getSuppliers, updateSupplierRequest } from "@/services/suppliersApi";

type Props = {
  children: ReactNode;
};

const sortSuppliers = (suppliers: SupplierWithRelations[]) =>
  [...suppliers].sort((first, second) =>
    first.name.localeCompare(
      second.name,
      "es",
    ),
  );

export function SuppliersProvider({children,}: Props) {
  const { can } = usePermissions();
  const [suppliers, setSuppliers] = useState<SupplierWithRelations[]>([]);

  const [ isLoadingSuppliers, setIsLoadingSuppliers ] = useState(true);

  const [ suppliersError, setSuppliersError ] = useState<string | null>(null);

  const refreshSuppliersRequest = useRef<Promise<void> | null>(null);
  const refreshSuppliers = useCallback(async () => {
    if (refreshSuppliersRequest.current) return refreshSuppliersRequest.current;
    const request = (async () => {
      if (!can("suppliers.read")) { setSuppliers([]); setSuppliersError(null); setIsLoadingSuppliers(false); return; }
        try {
          setIsLoadingSuppliers(true);
          setSuppliersError(null);
  
          const response = await getSuppliers();
  
          setSuppliers(sortSuppliers(response));
        } catch (error) {
          console.error( "Error loading suppliers:", error);
  
          setSuppliersError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los proveedores."
          );
        } finally {
          setIsLoadingSuppliers(false);
        }
    })();
    refreshSuppliersRequest.current = request;
    try { await request; } finally { if (refreshSuppliersRequest.current === request) refreshSuppliersRequest.current = null; }
  }, [can]);

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
