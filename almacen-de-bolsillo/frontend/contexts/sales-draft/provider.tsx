import { ReactNode, useState } from "react";
import { SalesDraftContext } from "./context";
import type { CreateSalesOrderItemDto } from "@almacen/shared";

type SalesDraftProviderProps = {
  children: ReactNode;
};

export function SalesDraftProvider({ children }: SalesDraftProviderProps) {
  const [items, setItems] = useState<CreateSalesOrderItemDto[]>([]);

  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

  function addItems(newItems: CreateSalesOrderItemDto[]) {
    setItems((currentItems) => {
      const nextItems = [...currentItems];

      for (const item of newItems) {
        const existingItemIndex = nextItems.findIndex((currentItem) => currentItem.productId === item.productId);

        if (existingItemIndex >= 0) {
          const existingItem = nextItems[existingItemIndex];
          nextItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + item.quantity,
          };
        } else {
          nextItems.push(item);
        }
      }

      return nextItems;
    });
  }

  function addItem(item: CreateSalesOrderItemDto) {
    addItems([item]);
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
        addItems,
        removeItem,
        clearSales,
      }}>
      {children}
    </SalesDraftContext.Provider>
  );
}
