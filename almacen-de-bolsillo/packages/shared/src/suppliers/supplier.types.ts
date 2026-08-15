import type { PurchaseOrderDto } from "../purchases/purchase.types.js";
import type { Product } from "../products/product.types.js";

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
  products: Product[];
  purchaseOrders: PurchaseOrderDto[];
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
  productIds?: number[];
};

// Delete
export type DeleteSupplierDto = {
  id: number;
};
