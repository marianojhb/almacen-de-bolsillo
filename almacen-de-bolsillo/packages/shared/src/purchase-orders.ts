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
};

export type PurchaseOrderWithItemsDto = PurchaseOrderDto & {
  purchaseOrdersItems: PurchaseOrderItemDto[];
};

export type NewPurchaseOrderDto = Omit<PurchaseOrderDto, "id" | "date" | "createdAt" | "updatedAt" | "isActive">;

export type NewPurchaseOrderItemDto = Omit<PurchaseOrderItemDto, "createdAt" | "updatedAt">;

export type NewPurchaseOrderWithItemsDto = NewPurchaseOrderDto & {
  purchaseOrdersItems: NewPurchaseOrderItemDto[];
};
