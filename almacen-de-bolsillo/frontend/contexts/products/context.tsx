import { createContext } from "react";
import type {
  CreateProductDto,
  Category,
  CreateCategoryDto,
  UpdateProductDto,
  SupplierOption,
  ProductWithRelations,
} from "@almacen/shared";

interface ProductsContextType {
  products: ProductWithRelations[];
  categories: Category[];
  suppliers: SupplierOption[];
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  isLoadingSuppliers: boolean;
  productsError: string | null;
  categoriesError: string | null;
  suppliersError: string | null;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshSuppliers: () => Promise<void>;
  clearProducts: () => void;
  clearCategories: () => void;
  clearSuppliers: () => void;
  addProduct: (product: CreateProductDto) => Promise<boolean>; // booleano, si el producto ya existe o no
  updateProduct: (updatedProduct: UpdateProductDto, id: number) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  addCategory: (category: CreateCategoryDto) => Promise<Category>;
}

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);
