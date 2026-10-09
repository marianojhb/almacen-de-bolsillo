import type { StockMovement, CreateStockMovementDto } from "@almacen/shared";

import { apiFetch } from "./apiClient";

export async function getStockMovementsRequest(id: number): Promise<StockMovement[]> {
  const response = await apiFetch(`/stock-movements/product/id/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error fetching movements");
  }

  return response.json();
}

export async function postStockMovementRequest(newStockMovement: CreateStockMovementDto): Promise<StockMovement> {
  const response = await apiFetch(`/stock-movements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newStockMovement),
  });

  if (!response.ok) {
    throw new Error("Error creating stock movement");
  }

  return response.json();
}
