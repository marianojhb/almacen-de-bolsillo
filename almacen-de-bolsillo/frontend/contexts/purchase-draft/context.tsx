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
  addItem: (item: PurchaseDraftItem) => void;
  toggleProduct: (item: PurchaseDraftItem) => void;
  updateItem: (productId: number, changes: Partial<PurchaseDraftItem>) => void;
  removeItem: (productId: number) => void;
  clearPurchase: () => void;
}

export const PurchaseDraftContext = createContext<PurchaseDraftContextType | undefined>(undefined);
