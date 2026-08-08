import { createContext } from "react";
import type {
  CreateProductDto,
  Category,
  CreateCategoryDto,
  UpdateProductDto,
  ProductWithRelations,
} from "@almacen/shared";

interface ProductsContextType {
  products: ProductWithRelations[];
  categories: Category[];
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  productsError: string | null;
  categoriesError: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: CreateProductDto) => Promise<boolean>; // booleano, si el producto ya existe o no
  updateProduct: (updatedProduct: UpdateProductDto, id: number) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  addCategory: (category: CreateCategoryDto) => Promise<Category>;
}

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);
