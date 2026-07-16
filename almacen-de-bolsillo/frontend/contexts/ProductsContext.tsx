import { createContext } from "react";
import type { Product, NewProduct } from "@/types/Product";

export type ProductsContextType = {
  products: Product[];
  addProduct: (product: NewProduct) => void;
  updateProduct: (updatedProduct: Product) => void;
};

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);
