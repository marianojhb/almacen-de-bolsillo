import { createContext } from "react";
import type { CreateProductDto, Category, CreateCategoryDto, UpdateProductDto, ProductWithRelations, DeleteProductDto } from "@almacen/shared";

interface ProductsContextType {
  products: ProductWithRelations[];
  categories: Category[];
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  productsError: string | null;
  categoriesError: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: CreateProductDto) => Promise<boolean>; // booleano, si el producto ya existe o no
  updateProduct: (updatedProduct: UpdateProductDto) => Promise<boolean>;
  deleteProduct: (updatedProduct: DeleteProductDto) => Promise<boolean>;
  addCategory: (category: CreateCategoryDto) => Promise<Category>;
}

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);
