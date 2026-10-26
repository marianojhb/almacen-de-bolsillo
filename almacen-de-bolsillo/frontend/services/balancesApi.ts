import type { BalanceDto, CreateBalanceDto } from "@almacen/shared";

import { apiRequest } from "@/services/apiClient";

type BalanceResponse = Omit<BalanceDto, "employeeId" | "cashIn" | "cashOut" | "expectedClosing" | "actualClosing" | "difference" | "opening"> & {
  employeeId?: number | string | null;
  cashIn: number | string;
  cashOut: number | string;
  expectedClosing: number | string;
  actualClosing: number | string;
  difference: number | string;
  opening: number | string;
};

const normalizeBalance = (balance: BalanceResponse): BalanceDto => ({
  ...balance,
  employeeId: balance.employeeId == null ? null : Number(balance.employeeId),
  cashIn: Number(balance.cashIn),
  cashOut: Number(balance.cashOut),
  expectedClosing: Number(balance.expectedClosing),
  actualClosing: Number(balance.actualClosing),
  difference: Number(balance.difference),
  opening: Number(balance.opening),
});

export async function getBalancesRequest(): Promise<BalanceDto[]> {
  const balances = await apiRequest<BalanceResponse[]>("/balances");
  return balances.map(normalizeBalance);
}

export async function createBalanceRequest(balance: CreateBalanceDto): Promise<BalanceDto> {
  const createdBalance = await apiRequest<BalanceResponse>("/balances", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(balance),
  });

  return normalizeBalance(createdBalance);
}
