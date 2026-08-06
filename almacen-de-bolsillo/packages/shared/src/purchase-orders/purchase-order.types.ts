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
