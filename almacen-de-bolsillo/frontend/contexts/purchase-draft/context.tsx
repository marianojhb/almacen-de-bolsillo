import { createContext } from "react";

export type PurchaseDraftItem = {
  productId: number;
  quantity: number | null;
  shortname: string | null;
  longname: string | null;
  price: number | null;
  discount: number | null;
  subtotal: number | null;
};

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
