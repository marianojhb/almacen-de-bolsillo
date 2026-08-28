import type { PurchaseOrderDto } from "../purchases/purchase.types.js";
import type { ProductWithRelations } from "../index.js";

export type ProductOnSupplier = {
  productId: number;
  supplierId: number;
  price?: number | null;
  supplierCategory?: string | null;
  unitsPerPaq?: number | null;
  pricePerPaq: number;
  minimumQuantity?: number | null;
  salesTerms?: string | null;
  leadTimeDays?: number | null;
  product: ProductWithRelations;
};

// Read
export type Supplier = {
  id: number;
  name: string;
  cuit: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

export type SupplierWithRelations = Supplier & {
  purchaseOrders: PurchaseOrderDto[];
  products: ProductOnSupplier[];
};

export type SupplierProductRelationInput = {
  productId: number;
  price?: number | null;
  supplierCategory?: string | null;
  unitsPerPaq?: number | null;
  pricePerPaq: number;
  minimumQuantity?: number | null;
  salesTerms?: string | null;
  leadTimeDays?: number | null;
};

// Create
export type CreateSupplierDto = {
  name: string;
  cuit: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

// Update
export type UpdateSupplierDto = Partial<CreateSupplierDto> & {
  isActive?: boolean;
  productIds?: number[] | SupplierProductRelationInput[];
};

// Delete
export type DeleteSupplierDto = {
  id: number;
};
