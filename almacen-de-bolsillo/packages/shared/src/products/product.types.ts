import type { Category } from "../categories/category.types.js";
import type { Supplier } from "../suppliers/supplier.types.js";

export type Product = {
  id: number;
  sku: string;
  shortname: string;
  longname: string;
  description: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
  stock: number;
  stockMin: number;
  discount: number | null;
  categoryId: number;
  isActive: boolean;
};

export type CreateProductDto = {
  sku: string;
  shortname: string;
  longname: string;
  price: number;
  stock: number;
  stockMin: number;
  description: string | null;
  categoryId: number;
  supplierIds: number[];
  isActive: boolean;
  discount: number | null;
};

export type UpdateProductDto = Partial<CreateProductDto>; // se actualiza con PATCH, por lo que todos los campos son opcionales

export type ProductWithRelations = Product & {
  category: Category;
  suppliers: Supplier[] | null;
};

export type ProductWithCategory = Product & {
  category: Category;
};

export type ProductWithSupplier = Product & {
  suppliers: Supplier[] | null;
};
