import { createContext } from "react";

export type PurchaseDraftItem = {
  productId: number;
  quantity: number;
  shortname: string;
  longname: string | null;
  price: number;
  discount: number;
  subtotal: number;
};

interface PurchaseDraftContextType {
  items: PurchaseDraftItem[];
  totalAmount: number;
  addItem: (item: PurchaseDraftItem) => void;
  removeItem: (productId: number) => void;
  clearPurchase: () => void;
}

export const PurchaseDraftContext = createContext<PurchaseDraftContextType | undefined>(undefined);