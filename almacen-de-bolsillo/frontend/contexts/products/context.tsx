import { createContext } from "react";
import type { Product, ProductWithCategory, NewProduct } from "@/types/Product";

export type ProductsContextType = {
  products: ProductWithCategory[];
  isLoadingProducts: boolean;
  productsError: string | null;
  addProduct: (product: NewProduct) => Promise<boolean>; // booleano, si el producto ya existe o no
  updateProduct: (updatedProduct: Product) => Promise<boolean>;
  deleteProduct: (updatedProduct: Product) => Promise<boolean>;
};

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);
