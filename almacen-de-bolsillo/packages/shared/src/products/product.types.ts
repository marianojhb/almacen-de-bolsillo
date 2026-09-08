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
  discount: number;
  categoryId: number;
  isActive: boolean;
};

export type ProductSupplierRelationInput = {
  supplierId: number;
  price?: number | null;
  supplierCategory?: string | null;
  unitsPerPaq?: number | null;
  pricePerPaq: number;
  minimumQuantity?: number | null;
  salesTerms?: string | null;
  leadTimeDays?: number | null;
};

export type ProductSupplierRelation = ProductSupplierRelationInput & {
  productId: number;
  supplier: Supplier;
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
  isActive: boolean;
  discount: number;
  supplierRelations?: ProductSupplierRelationInput[];
};

export type UpdateProductDto = Partial<CreateProductDto>; // se actualiza con PATCH, por lo que todos los campos son opcionales

export type ProductWithRelations = Product & {
  category: Category;
  suppliers: ProductSupplierRelation[];
};

export type ProductWithCategory = Product & {
  category: Category;
};

export type ProductWithSupplier = Product & {
  suppliers: ProductSupplierRelation[];
};
