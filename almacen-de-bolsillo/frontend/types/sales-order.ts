export type SalesOrder = {
  id: number;
  invoice: string;
  createdAt: Date;
  discount: number;
  iva: number;
  isActive: boolean;
  total: number; // Final amount, including IVA and discount
  updatedAt: Date;
  paymentMethod: "EFECTIVO" | "MERCADOPAGO" | "UALA";
};

export type SalesOrderItem = {
  productId: number;
  salesOrdersItemId: number;
  quantity: number;
  shortname: string;
  longname: string;
  price: number;
  subtotal: number;
  discount: number;
  createdAt: Date;
  updatedAt: Date; // Replace 'SalesOrder' with the actual type of the sales order
};

export type SalesOrderWithItems = SalesOrder & {
  salesOrdersItems: SalesOrderItem[];
};

// --------------- Nuevas ventas:

export type NewSalesOrder = Omit<SalesOrder, "id" | "createdAt" | "updatedAt" | "isActive">;

export type NewSalesOrderItem = Omit<SalesOrderItem, "salesOrdersItemId" | "createdAt" | "updatedAt">;

export type NewSalesOrderWithItems = NewSalesOrder & {
  newSalesOrdersItems: NewSalesOrderItem[];
};
