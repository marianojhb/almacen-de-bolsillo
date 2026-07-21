import { createContext } from "react";
import type { Product, NewProduct } from "@/types/Product";

export type ProductsContextType = {
  products: Product[];
  activeProducts: Product[];
  isLoadingProducts: boolean;
  productsError: string | null;
  addProduct: (product: NewProduct) => Promise<boolean>; // booleano, si el producto ya existe o no
  updateProduct: (updatedProduct: Product) => Promise<boolean>;
  deleteProduct: (updatedProduct: Product) => Promise<boolean>;
};

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);
