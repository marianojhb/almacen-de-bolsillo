import { ReactNode, useState, useEffect, useCallback } from "react";
import { PurchasesContext } from "./context";
import { CreatePurchaseOrderDto, PurchaseOrderDto } from "@almacen/shared";
import { getPurchases, createPurchaseOrderRequest, deletePurchaseOrderRequest } from "@/services/purchasesApi";

type PurchaseProviderProps = {
  children: ReactNode;
};

export function PurchasesProvider(props: PurchaseProviderProps) {
  const [purchases, setPurchases] = useState<PurchaseOrderDto[]>([]);
  const [totalPurchases, setTotalPurchases] = useState(0);

  // State to track loading and error states
  const [isLoadingPurchases, setIsLoadingPurchases] = useState<boolean>(false);
  const [errorPurchases, setErrorPurchases] = useState<string | null>(null);

  const refreshPurchases = useCallback(async () => {
    try {
      setIsLoadingPurchases(true);
      setErrorPurchases(null);

      const data = await getPurchases(); // Replace with your API endpoint

      setPurchases(data);
      setTotalPurchases(
        data.reduce((accumulator: number, purchase: PurchaseOrderDto) => accumulator + Number(purchase.total), 0),
      );
    } catch (error) {
      console.error("Error fetching purchases:", error);
      setErrorPurchases("Error fetching sales orders with items");
    } finally {
      setIsLoadingPurchases(false);
    }
  }, []);

  useEffect(() => {
    void refreshPurchases();
  }, [refreshPurchases]);

  async function addPurchase(purchase: CreatePurchaseOrderDto): Promise<boolean> {
    // Implement the logic to add a purchase
    try {
      const newPurchase = await createPurchaseOrderRequest(purchase);
      setPurchases((prevPurchases) => [...prevPurchases, newPurchase]);
      setTotalPurchases((prevTotal) => prevTotal + Number(newPurchase.total));
      return true;
    } catch (error) {
      console.log("Error creating purchase order:", error);
      return false;
    }
  }

  async function deletePurchase(purchaseId: number): Promise<boolean> {
    // Implement the logic to remove a purchase
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
    // Implement the logic to clear all purchases
    setPurchases([]);
    setTotalPurchases(0);
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
