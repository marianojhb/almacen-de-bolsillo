// This file contains the types for sales orders and their related entities.
import type { Product, MeasurementUnit } from "../index.js";


import type { PaymentMethod, WalletProvider } from "../transactions/payment-options.js";

// Sales Order Types

export type SalesOrderItem = {
  salesOrderId: number;
  productId: number;
  measurementUnit: MeasurementUnit;
  quantity: number;
  shortname: string;
  longname: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
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
  walletProvider: WalletProvider | null;
  discount: number;
  ivaSales: number;
  isActive: boolean;
  taxableBase: number;
  subtotal: number;
  total: number;
  updatedAt: string;
  seller: { id: number; username: string | null; name: string };
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
  sellerId?: number; // Compatibilidad: el backend siempre usa la sesión.
  paymentMethod: PaymentMethod;
  walletProvider: WalletProvider | null;
  discount: number;
  ivaSales: number;
  taxableBase: number;
  total: number;
  subtotal: number;
  salesOrderItems: CreateSalesOrderItemDto[];
};

export type SalesDraftItem = CreateSalesOrderItemDto & { measurementUnit: MeasurementUnit };

// Update
export type UpdateSalesOrderDto = { invoice?: string; isActive?: boolean };

// Delete
export type DeleteSalesOrderDto = {
  id: number;
};

export type SalesOrderWithRelationsDto = SalesOrder & {
  salesOrderItems: SalesOrderItem[];
};
