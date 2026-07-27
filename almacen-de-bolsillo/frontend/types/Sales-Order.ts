import type { Product } from "./Product";

export type SalesOrder = {
  id: number;
  invoice: string;
  sellerId: number;
  createdAt: Date;
  discount: number;
  iva: number;
  isActive: boolean;
  total: number;
  updatedAt: Date;
  paymentMethod: "EFECTIVO" | "MERCADOPAGO" | "UALA";
  salesOrdersItems: SalesOrderItem[];
};

export type NewSalesOrder = Omit<SalesOrder, "id" | "createdAt" | "updatedAt" | "isActive">;

export type SalesOrderItem = {
  salesOrdersItemId: number;
  productId: number;
  quantity: number;
  shortname: string;
  longname: string;
  price: number;
  subtotal: number;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
  salesOrder: SalesOrder; // Replace 'SalesOrder' with the actual type of the sales order
};

export type SalesOrderWithItems = SalesOrder & {
  salesOrdersItems: SalesOrderItem[];
};

export type NewSalesOrderItem = Omit<
  SalesOrderItem,
  "salesOrdersItemId" | "createdAt" | "updatedAt" | "product" | "salesOrder"
>;
