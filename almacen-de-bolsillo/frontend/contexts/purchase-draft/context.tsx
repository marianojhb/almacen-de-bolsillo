import { createContext } from "react";
import type { PurchaseDraftItem } from "@almacen/shared";

export type { PurchaseDraftItem } from "@almacen/shared";

interface PurchaseDraftContextType {
  items: PurchaseDraftItem[];
  totalAmount: number;
  purchaseQuantities: Record<string, number>;
  addItem: (item: PurchaseDraftItem) => void;
  toggleProduct: (item: PurchaseDraftItem) => void;
  updateItem: (productId: number, changes: Partial<PurchaseDraftItem>) => void;
  removeItem: (productId: number) => void;
  clearPurchase: () => void;
  setPurchaseQuantities: (quantities: Record<string, number>) => void;
  updatePurchaseQuantity: (productId: number, supplierId: number, quantity: number) => void;
}

export const PurchaseDraftContext = createContext<PurchaseDraftContextType | undefined>(undefined);
