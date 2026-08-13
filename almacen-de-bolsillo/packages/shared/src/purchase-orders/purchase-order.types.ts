import type { Product } from "../index.js";
import type { Supplier } from "../index.js";

export type PurchaseOrderDto = {
  id: number;
  date: string;
  total: number;
  supplierId: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  isActive: boolean;
};

export type PurchaseOrderItemDto = {
  productId: number;
  purchaseOrderId: number;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
};

export type CreatePurchaseOrderItemDto = {
  productId: number;
  quantity: number;
  price: number;
  discount: number;
};

export type CreatePurchaseOrderDto = {
  total: number;
  supplierId: number;
  userId: number;
  items: CreatePurchaseOrderItemDto[];
};

export type PurchaseOrderWithRelationsDto = PurchaseOrderDto & {
  supplier?: Supplier;
  purchaseOrdersItems?: PurchaseOrderItemDto[];
};
