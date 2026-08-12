import type { Transaction } from "@almacen/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getTransactionsRequest(from?: string, to?: string): Promise<Transaction[]> {
  const params = new URLSearchParams();

  if (from) params.append("from", from);

  if (to) params.append("to", to);

  const response = await fetch(`${API_URL}/transactions?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Error fetching transactions");
  }

  return response.json();
}
