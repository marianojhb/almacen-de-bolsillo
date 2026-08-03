export type PaymentMethod = "EFECTIVO" | "MERCADOPAGO" | "UALA";

export type SalesOrderDto = {
  id: number;
  invoice: string | null;
  createdAt: string;
  discount: number;
  iva: number;
  isActive: boolean;
  total: number;
  updatedAt: string;
  paymentMethod: PaymentMethod;
};

export type SalesOrderItemDto = {
  productId: number;
  salesOrdersItemId: number;
  quantity: number;
  shortname: string;
  longname: string | null;
  price: number;
  subtotal: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
};

export type SalesOrderWithItemsDto = SalesOrderDto & {
  salesOrdersItems: SalesOrderItemDto[];
};

export type NewSalesOrderDto = Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt" | "isActive">;

export type NewSalesOrderItemDto = Omit<SalesOrderItemDto, "salesOrdersItemId" | "createdAt" | "updatedAt">;

export type NewSalesOrderWithItemsDto = NewSalesOrderDto & {
  salesOrdersItems: NewSalesOrderItemDto[];
};
