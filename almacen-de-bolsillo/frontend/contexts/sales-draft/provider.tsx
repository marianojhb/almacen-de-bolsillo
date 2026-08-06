import { ReactNode, useState } from "react";
import { SalesDraftContext } from "./context";
import type { NewSalesOrderItemDto } from "@almacen/shared";

type SalesDraftProviderProps = {
  children: ReactNode;
};

export function SalesDraftProvider({ children }: SalesDraftProviderProps) {
  const [items, setItems] = useState<NewSalesOrderItemDto[]>([]);

  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

  function addItem(item: NewSalesOrderItemDto) {
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
