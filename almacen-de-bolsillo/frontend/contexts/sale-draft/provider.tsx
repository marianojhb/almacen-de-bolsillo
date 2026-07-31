import { ReactNode, useState, useContext } from "react";
import { SaleDraftContext } from "./context";
import { SaleItem } from "@/types/sale-item";

type SalesDraftProviderProps = {
  children: ReactNode;
};

export function SalesDraftProvider({ children }: SalesDraftProviderProps) {
  const [items, setItems] = useState<SaleItem[]>([]);

  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

  function addItem(item: SaleItem) {
    setItems((currentItems) => {
      const itemAlreadyExists = items.some((currentProduct) => currentProduct.productId === item.productId);
      if (itemAlreadyExists) {
        return currentItems.map((updateItem) =>
          updateItem.productId === item.productId
            ? { ...updateItem, quantity: updateItem.quantity + item.quantity }
            : updateItem,
        );
      }
      return [...currentItems, item];
    });
  }

  function removeItem(productId: number) {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  }

  function clearSale() {
    setItems([]);
  }

  return (
    <SaleDraftContext.Provider
      value={{
        items,
        totalAmount,
        addItem,
        removeItem,
        clearSale,
      }}>
      {children}
    </SaleDraftContext.Provider>
  );
}
