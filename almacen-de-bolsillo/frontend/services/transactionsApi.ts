import type { CreateTransactionDto, TransactionDto } from "@almacen/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getTransactionsRequest(from?: string, to?: string): Promise<TransactionDto[]> {
  const params = new URLSearchParams();

  if (from) params.append("from", from);

  if (to) params.append("to", to);

  const response = await fetch(`${API_URL}/transactions?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Error fetching transactions");
  }

  return response.json();
}

export async function createTransactionRequest(newTransaction: CreateTransactionDto): Promise<TransactionDto> {
  const response = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTransaction),
  });

  if (!response.ok) {
    throw new Error("Error creating transaction");
  }

  return response.json();
}
