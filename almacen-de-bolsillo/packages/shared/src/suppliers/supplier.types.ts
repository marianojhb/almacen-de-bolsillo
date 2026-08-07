import type { PurchaseOrderDto } from "../purchase-orders/purchase-order.types.js";
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
  purchaseOrders: PurchaseOrderDto[];
  products: Product[];
};

// Read supplier with items

export type SupplierWithItems = Supplier & {
  products: Product[];
};

// Create
export type CreateSupplierDto = {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  cuit: string;
};

// Update
export type UpdateSupplierDto = Partial<CreateSupplierDto>;

// Delete
export type DeleteSupplierDto = {
  id: number;
};
