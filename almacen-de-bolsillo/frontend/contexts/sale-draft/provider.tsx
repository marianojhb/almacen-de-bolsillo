import { ReactNode, useState } from "react";
import { SaleDraftContext } from "./context";
import type { NewSalesOrderItem } from "@/types/sales-order";

type SalesDraftProviderProps = {
  children: ReactNode;
};

export function SalesDraftProvider({ children }: SalesDraftProviderProps) {
  const [items, setItems] = useState<NewSalesOrderItem[]>([]);

  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

  function addItem(item: NewSalesOrderItem) {
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
