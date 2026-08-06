import { createContext } from "react";
import type { Product, ProductWithCategory, CreateProductDto, Category, CreateCategoryDto } from "@almacen/shared";

interface ProductsContextType {
  products: ProductWithCategory[];
  categories: Category[];
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  productsError: string | null;
  categoriesError: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: CreateProductDto) => Promise<boolean>; // booleano, si el producto ya existe o no
  updateProduct: (updatedProduct: Product) => Promise<boolean>;
  deleteProduct: (updatedProduct: Product) => Promise<boolean>;
  addCategory: (category: CreateCategoryDto) => Promise<Category>;
}

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);
