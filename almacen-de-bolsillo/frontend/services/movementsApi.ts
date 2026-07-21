import type { StockMovement, NewStockMovement } from "@/types/StockMovement";

const API_URL = "http://192.168.0.45:3000";

export async function getStockMovements(id: number): Promise<StockMovement[]> {
  const response = await fetch(`${API_URL}/stock-movements/product/id/${id}`, {
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

export async function postStockMovement(newStockMovement: NewStockMovement): Promise<StockMovement> {
  const response = await fetch(`${API_URL}/stock-movements`, {
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
