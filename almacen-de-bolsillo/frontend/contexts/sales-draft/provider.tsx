import { ReactNode, useState } from "react";
import { SalesDraftContext } from "./context";
import { lineAmount, sumAmounts, type SalesDraftItem } from "@almacen/shared";

type SalesDraftProviderProps = {
  children: ReactNode;
};

export function SalesDraftProvider({ children }: SalesDraftProviderProps) {
  const [items, setItems] = useState<SalesDraftItem[]>([]);

  const totalAmount = sumAmounts(items.map((item) => lineAmount(item.quantity, item.price, item.discount)));

  function addItem(item: SalesDraftItem) {
    setItems((currentItems) => {
      const itemAlreadyExists = currentItems.some((currentProduct) => currentProduct.productId === item.productId);
      if (itemAlreadyExists) {
        return currentItems.map((updateItem) =>
          updateItem.productId === item.productId
            ? { ...updateItem, quantity: Math.round((updateItem.quantity + item.quantity) * 1000) / 1000 }
            : updateItem,
        );
      }
      return [...currentItems, item];
    });
  }

  function removeItem(productId: number) {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  }

  function clearSales() {
    setItems([]);
  }

  return (
    <SalesDraftContext.Provider
      value={{
        items,
        totalAmount,
        addItem,
        removeItem,
        clearSales,
      }}>
      {children}
    </SalesDraftContext.Provider>
  );
}
