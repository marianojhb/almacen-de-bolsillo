import { createContext } from "react";
import { CreatePurchaseOrderDto, PurchaseOrderDto } from "@almacen/shared";

interface PurchasesContextType {
  purchases: PurchaseOrderDto[];
  isLoadingPurchases: boolean;
  errorPurchases: string | null;
  totalPurchases: number;
  addPurchase: (purchase: CreatePurchaseOrderDto) => Promise<boolean>;
  deletePurchase: (purchaseId: number) => Promise<boolean>;
  refreshPurchases: () => Promise<void>;
  clearPurchases: () => void;
}

export const PurchasesContext = createContext<PurchasesContextType | undefined>(undefined);
