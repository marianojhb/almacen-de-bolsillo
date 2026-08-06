// This file contains the types for sales orders and their related entities.
export type PaymentMethod = "EFECTIVO" | "MERCADOPAGO" | "UALA";

// Sales Order Types

export type SalesOrderItem = {
  id: number;
  salesOrderId: number;
  productId: number;
  shortname: string;
  longname: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
};

export type SalesOrder = {
  id: number;
  invoice: string;
  sellerId: number;
  paymentMethod: PaymentMethod;
  discount: number;
  iva: number;
  total: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  sellerId: number;
  paymentMethod: PaymentMethod;
  discount: number;
  iva: number;
  total: number;
  salesOrderItems: CreateSalesOrderItemDto[];
};

// Update
export type UpdateSalesOrderDto = Partial<CreateSalesOrderDto>;

// Delete
export type DeleteSalesOrderDto = {
  id: number;
};
