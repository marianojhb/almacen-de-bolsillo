import { createContext } from "react";
import type { Product, NewProduct } from "@/types/Product";

export type ProductsContextType = {
  products: Product[];
  addProduct: (product: NewProduct) => boolean; // booleano, si el producto ya existe o no
  updateProduct: (updatedProduct: Product) => boolean;
};

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);
