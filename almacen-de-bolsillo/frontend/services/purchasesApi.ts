import type { PurchaseOrderWithRelationsDto, CreatePurchaseOrderDto, PurchaseOrderDto } from "@almacen/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getPurchases(): Promise<PurchaseOrderDto[]> {
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

export async function getPurchaseById(purchaseOrderId: number): Promise<PurchaseOrderWithRelationsDto> {
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

export async function createPurchaseOrderRequest(purchaseOrder: CreatePurchaseOrderDto): Promise<PurchaseOrderDto> {
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
export async function deletePurchaseOrderRequest(purchaseOrderId: number): Promise<void> {
  const response = await fetch(`${API_URL}/purchase-orders/${purchaseOrderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive: false }),
  });
  if (!response.ok) {
    throw new Error("Error deleting sales order");
  }
}
