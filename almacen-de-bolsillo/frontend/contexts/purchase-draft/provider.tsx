import { ReactNode, useState } from "react";
import { PurchaseDraftContext, type PurchaseDraftItem } from "./context";

type PurchaseDraftProviderProps = {
  children: ReactNode;
};

export function PurchaseDraftProvider({ children }: PurchaseDraftProviderProps) {
  const [items, setItems] = useState<PurchaseDraftItem[]>([]);

  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

  function addItem(item: PurchaseDraftItem) {
    setItems((currentItems) => {
      const itemAlreadyExists = currentItems.some((currentItem) => currentItem.productId === item.productId);

      if (itemAlreadyExists) {
        return currentItems.map((currentItem) =>
          currentItem.productId === item.productId
            ? {
                ...currentItem,
                quantity: currentItem.quantity + item.quantity,
                subtotal: (currentItem.quantity + item.quantity) * item.price,
              }
            : currentItem,
        );
      }

      return [...currentItems, { ...item, subtotal: item.quantity * item.price }];
    });
  }

  function removeItem(productId: number) {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  }

  function clearPurchase() {
    setItems([]);
  }

  return (
    <PurchaseDraftContext.Provider value={{ items, totalAmount, addItem, removeItem, clearPurchase }}>
      {children}
    </PurchaseDraftContext.Provider>
  );
}
