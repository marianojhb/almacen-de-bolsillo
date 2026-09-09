import type { Category } from "../categories/category.types.js";
import type {
  CreateProductOnSupplierDto,
  CreateProductOnSupplierFromProductDto,
} from "../product-suppliers/product-supplier.types.js";
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

export type ProductOnSupplierWithSupplierDto = CreateProductOnSupplierDto & {
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
  supplierRelations?: CreateProductOnSupplierFromProductDto[];
};

export type UpdateProductDto = Partial<CreateProductDto>; // se actualiza con PATCH, por lo que todos los campos son opcionales

export type ProductWithRelations = Product & {
  category: Category;
  suppliers: ProductOnSupplierWithSupplierDto[];
};

export type ProductWithCategory = Product & {
  category: Category;
};

export type ProductWithSupplier = Product & {
  suppliers: ProductOnSupplierWithSupplierDto[];
};
