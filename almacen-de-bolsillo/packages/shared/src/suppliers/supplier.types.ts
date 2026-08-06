import type { Product } from "../index.js";

// Read
export type Supplier = {
  id: number;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  cuit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
