import { useContext } from "react";
import { ProductsContext } from "./context";

export function useProducts() {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error("useProducts debe utilizarse dentro de ProductsProvider");
  }

  return context;
}
