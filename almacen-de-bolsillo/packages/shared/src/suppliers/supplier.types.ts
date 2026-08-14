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

// Read supplier with items

export type SupplierWithItems = Supplier & {
  purchaseOrders: PurchaseOrderDto[];
  products: Product[];
};

export type UpdateSupplierProductsDto = {
  productIds: number[];
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
};

// Delete
export type DeleteSupplierDto = {
  id: number;
};
