import { ReactNode, useState } from "react";
import { PurchaseDraftContext, type PurchaseDraftItem } from "./context";

type PurchaseDraftProviderProps = {
  children: ReactNode;
};

export function PurchaseDraftProvider({ children }: PurchaseDraftProviderProps) {
  const [items, setItems] = useState<PurchaseDraftItem[]>([]);
  const [purchaseQuantities, setPurchaseQuantities] = useState<Record<string, number>>({});

  const totalAmount = items.reduce((total, item) => total + (item.subtotal || 0), 0);

  function addItem(item: PurchaseDraftItem) {
    setItems((currentItems) => {
      const itemAlreadyExists = currentItems.some((currentItem) => currentItem.productId === item.productId);

      if (itemAlreadyExists) {
        return currentItems.map((currentItem) =>
          currentItem.productId === item.productId
            ? {
                ...currentItem,
                quantity: (currentItem.quantity ?? 0) + (item.quantity ?? 0),
                subtotal: ((currentItem.quantity ?? 0) + (item.quantity ?? 0)) * (item.price ?? 0),
              }
            : currentItem,
        );
      }

      return [...currentItems, { ...item, subtotal: (item.quantity ?? 0) * (item.price ?? 0) }];
    });
  }

  function toggleProduct(item: PurchaseDraftItem) {
    setItems((currentItems) => {
      const isSelected = currentItems.some((currentItem) => currentItem.productId === item.productId);

      if (isSelected) {
        return currentItems.filter((currentItem) => currentItem.productId !== item.productId);
      }

      return [...currentItems, item];
    });
  }

  function updateItem(productId: number, changes: Partial<PurchaseDraftItem>) {
    setItems((currentItems) =>
      currentItems.map((currentItem) => {
        if (currentItem.productId !== productId) {
          return currentItem;
        }

        const updatedItem = {
          ...currentItem,
          ...changes,
        };

        return {
          ...updatedItem,
          subtotal: (updatedItem.quantity ?? 0) * (updatedItem.price ?? 0),
        };
      }),
    );
  }

  function removeItem(productId: number) {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
    setPurchaseQuantities((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([key]) => {
          const [keyProductId] = key.split("-").map(Number);

          return keyProductId !== productId;
        }),
      ),
    );
  }

  function clearPurchase() {
    setItems([]);
    setPurchaseQuantities({});
  }

  function updatePurchaseQuantity(productId: number, supplierId: number, quantity: number) {
    const key = `${productId}-${supplierId}`;

    setPurchaseQuantities((current) => ({
      ...current,
      [key]: quantity,
    }));
  }
  return (
    <PurchaseDraftContext.Provider
      value={{
        items,
        totalAmount,
        purchaseQuantities,
        addItem,
        toggleProduct,
        updateItem,
        removeItem,
        clearPurchase,
        updatePurchaseQuantity,
        setPurchaseQuantities,
      }}>
      {children}
    </PurchaseDraftContext.Provider>
  );
}
