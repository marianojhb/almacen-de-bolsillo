import type { NewPurchaseOrderItemDto, PurchaseOrderDto, PurchaseOrderWithItemsDto } from "@almacen/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getPurchasesWithItems(): Promise<PurchaseOrderWithItemsDto[]> {
  const response = await fetch(`${API_URL}/purchase-orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error fetching purchases");
  }

  return response.json();
}

export async function getPurchaseById(purchaseOrderId: number): Promise<PurchaseOrderWithItemsDto> {
  const response = await fetch(`${API_URL}/purchase-orders/${purchaseOrderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error fetching purchase details");
  }

  return response.json();
}

type CreatePurchaseOrderPayload = {
  total: number;
  supplierId: number;
  userId?: number;
};

export async function createPurchaseOrderRequest(purchaseOrder: CreatePurchaseOrderPayload): Promise<PurchaseOrderDto> {
  const response = await fetch(`${API_URL}/purchase-orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(purchaseOrder),
  });

  if (!response.ok) {
    throw new Error("Error creating purchase order");
  }

  return response.json();
}

export async function createPurchaseOrderItemRequest(purchaseOrderItem: NewPurchaseOrderItemDto): Promise<void> {
  const response = await fetch(`${API_URL}/purchase-orders-items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(purchaseOrderItem),
  });

  if (!response.ok) {
    throw new Error("Error creating purchase order item");
  }
}
