import { createContext } from "react";
import type { Product, ProductWithCategory, NewProduct, Category, NewCategory } from "@/types/Product";

export type ProductsContextType = {
  products: ProductWithCategory[];
  categories: Category[];
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  productsError: string | null;
  categoriesError: string | null;
  addProduct: (product: NewProduct) => Promise<boolean>; // booleano, si el producto ya existe o no
  updateProduct: (updatedProduct: Product) => Promise<boolean>;
  deleteProduct: (updatedProduct: Product) => Promise<boolean>;
  addCategory: (category: NewCategory) => Promise<Category>;
};

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);
