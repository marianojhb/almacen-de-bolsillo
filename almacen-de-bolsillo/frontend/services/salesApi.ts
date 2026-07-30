import type { NewSalesOrder, SalesOrder, SalesOrderWithItems } from "@/types/Sales-Order";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getSalesOrders(): Promise<SalesOrder[]> {
  const response = await fetch(`${API_URL}/sales-orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error fetching sales orders");
  }

  return response.json();
}

export async function getSalesOrdersWithItems(): Promise<SalesOrderWithItems[]> {
  const response = await fetch(`${API_URL}/with-items`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error fetching sales orders with items");
  }

  return response.json();
}

export async function createSalesOrderRequest(salesOrder: NewSalesOrder): Promise<SalesOrder> {
  const response = await fetch(`${API_URL}/sales-orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(salesOrder),
  });

  if (!response.ok) {
    throw new Error("Error creating sales order");
  }

  return response.json();
}

export async function deleteSalesOrderRequest(salesOrderId: number): Promise<void> {
  const response = await fetch(`${API_URL}/sales-orders/${salesOrderId}`, {
    method: "UPDATE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive: false }),
  });
  if (!response.ok) {
    throw new Error("Error deleting sales order");
  }
}
