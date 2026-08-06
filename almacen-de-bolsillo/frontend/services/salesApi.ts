import type { NewSalesOrderWithItemsDto, SalesOrderWithItemsDto } from "@almacen/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getSalesOrders(): Promise<SalesOrderWithItemsDto[]> {
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

export async function createSalesOrderRequest(salesOrder: NewSalesOrderWithItemsDto): Promise<SalesOrderWithItemsDto> {
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
