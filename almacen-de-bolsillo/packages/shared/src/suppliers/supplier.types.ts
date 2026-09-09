import type { PurchaseOrderDto } from "../purchases/purchase.types.js";
import type {
  CreateProductOnSupplierDto,
  CreateProductOnSupplierFromSupplierDto,
} from "../product-suppliers/product-supplier.types.js";
import type { ProductWithRelations } from "../products/product.types.js";

export type ProductOnSupplierWithProductDto = CreateProductOnSupplierDto & {
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
  products: ProductOnSupplierWithProductDto[];
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
  productIds?: number[] | CreateProductOnSupplierFromSupplierDto[];
};

// Delete
export type DeleteSupplierDto = {
  id: number;
};
