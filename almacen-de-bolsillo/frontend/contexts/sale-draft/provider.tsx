import { ReactNode, useState } from "react";
import { SaleDraftContext } from "./context";
import { SaleItem } from "@/types/sale-item";

type SalesDraftProviderProps = {
  children: ReactNode;
};

export function SalesDraftProvider({ children }: SalesDraftProviderProps) {
  const [items, setItems] = useState<SaleItem[]>([]);

  function addItem(item: SaleItem) {
    setItems((currentItems) => [...currentItems, item]);
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
        addItem,
        removeItem,
        clearSale,
      }}>
      {children}
    </SaleDraftContext.Provider>
  );
}
