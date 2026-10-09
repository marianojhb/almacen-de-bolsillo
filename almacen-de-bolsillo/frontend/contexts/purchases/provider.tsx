import { usePermissions } from "@/hooks/use-permissions";
import { useRef, ReactNode, useState, useEffect, useCallback } from "react";
import { PurchasesContext } from "./context";
import { CreatePurchaseOrderDto, PurchaseOrderDto } from "@almacen/shared";
import {
  getPurchaseOrdersRequest,
  createPurchaseOrderRequest,
  deletePurchaseOrderRequest,
} from "@/services/purchasesApi";

type PurchaseProviderProps = {
  children: ReactNode;
};

export function PurchasesProvider(props: PurchaseProviderProps) {
  const { can } = usePermissions();
  const [purchases, setPurchases] = useState<PurchaseOrderDto[]>([]);
  const totalPurchases = purchases.reduce((total, purchase) => total + Number(purchase.total), 0);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState<boolean>(false);
  const [errorPurchases, setErrorPurchases] = useState<string | null>(null);

  const refreshPurchasesRequest = useRef<Promise<void> | null>(null);
  const refreshPurchases = useCallback(async () => {
    if (refreshPurchasesRequest.current) return refreshPurchasesRequest.current;
    async function load() {
      if (!can("purchases.read")) { setPurchases([]); setErrorPurchases(null); setIsLoadingPurchases(false); return; }
      try {
        setIsLoadingPurchases(true);
        setErrorPurchases(null);
  
        const data = await getPurchaseOrdersRequest();
  
        setPurchases(data);
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setErrorPurchases("No se pudieron cargar las compras.");
      } finally {
        setIsLoadingPurchases(false);
      }
    }

    const request = load();
    refreshPurchasesRequest.current = request;
    return request.finally(() => {
      if (refreshPurchasesRequest.current === request) {
        refreshPurchasesRequest.current = null;
      }
    });
  }, [can]);

  useEffect(() => {
    void refreshPurchases();
  }, [refreshPurchases]);

  async function addPurchase(purchase: CreatePurchaseOrderDto): Promise<boolean> {
    if (!can("purchases.create")) return false;
    const newPurchase = await createPurchaseOrderRequest(purchase);
    setPurchases((prevPurchases) => [...prevPurchases, newPurchase]);
    return true;

  }

  async function deletePurchase(purchaseId: number): Promise<boolean> {
    if (!can("purchases.delete")) return false;
    try {
      await deletePurchaseOrderRequest(purchaseId);
      setPurchases((prevPurchases) => prevPurchases.filter((p) => p.id !== purchaseId));
      return true;
    } catch (error) {
      console.log("Error deleting purchase order:", error);
      return false;
    }
  }

  function clearPurchases() {
    setPurchases([]);
  }
  return (
    <PurchasesContext.Provider
      value={{
        purchases,
        totalPurchases,
        isLoadingPurchases,
        errorPurchases,
        addPurchase,
        refreshPurchases,
        deletePurchase,
        clearPurchases,
      }}>
      {props.children}
    </PurchasesContext.Provider>
  );
}
