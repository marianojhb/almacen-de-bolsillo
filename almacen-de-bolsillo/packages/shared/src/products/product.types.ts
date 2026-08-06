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
  supplierId: number | null;
  isActive: boolean;
};

export type CreateProductDto = {
  shortname: string;
  longname: string;
  price: number;
  stock: number;
  categoryId: number;
  supplierId: number | null;
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
