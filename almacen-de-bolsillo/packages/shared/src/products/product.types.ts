import type { MeasurementUnit } from "./measurement-unit.utils.js";
import type { Category } from "../categories/category.types.js";
import type {
  CreateProductOnSupplierDto,
  CreateProductOnSupplierFromProductDto,
} from "../product-suppliers/product-supplier.types.js";
import type { SupplierOption } from "../suppliers/supplier.types.js";

export type Product = {
  id: number;
  sku: string | null;
  measurementUnit: MeasurementUnit;
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
  supplier: SupplierOption;
};

export type CreateProductDto = {
  sku: string | null;
  measurementUnit: MeasurementUnit;
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
