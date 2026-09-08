// This file contains the types for sales orders and their related entities.
import type { ProductWithRelations } from "../index.js";
import type { User } from "../users/user.types.js";

export type PaymentMethod = "EFECTIVO" | "MERCADOPAGO" | "UALA";

// Sales Order Types

export type SalesOrderItem = {
  salesOrderId: number;
  productId: number;
  quantity: number;
  shortname: string;
  longname: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  product: ProductWithRelations;
  discount: number;
  subtotal: number;
};

export type SalesOrder = {
  id: number;
  invoice?: string;
  date: string;
  sellerId: number;
  createdAt: string;
  paymentMethod: PaymentMethod;
  discount: number;
  ivaSales: number;
  isActive: boolean;
  taxableBase: number;
  subtotal: number;
  total: number;
  updatedAt: string;
  seller: User;
  transactionId: number;
};

// DTOs CRUD

// Read
export type SalesOrderDto = SalesOrder & {
  salesOrderItems: SalesOrderItem[];
};

// Create

export type CreateSalesOrderItemDto = {
  productId: number;
  shortname: string;
  longname: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
};

export type CreateSalesOrderDto = {
  invoice: string;
  sellerId: number; // TODO: Conviene sacarlo porque el frontend no dice quien genero la venta. Preferiblemente JWT lo diga en req.user.id
  paymentMethod: PaymentMethod;
  discount: number;
  ivaSales: number;
  taxableBase: number;
  total: number;
  subtotal: number;
  salesOrderItems: CreateSalesOrderItemDto[];
};

// Update
export type UpdateSalesOrderDto = Partial<CreateSalesOrderDto>;

// Delete
export type DeleteSalesOrderDto = {
  id: number;
};

export type SalesOrderWithRelationsDto = SalesOrder & {
  salesOrderItems: SalesOrderItem[];
};
