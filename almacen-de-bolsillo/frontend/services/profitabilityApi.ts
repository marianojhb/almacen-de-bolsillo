import type { ProfitabilitySummaryDto } from "@almacen/shared";

import { apiRequest } from "@/services/apiClient";

type ProfitabilityResponse = Record<keyof ProfitabilitySummaryDto, number | string>;

export async function getProfitabilityRequest(): Promise<ProfitabilitySummaryDto> {
  const summary = await apiRequest<ProfitabilityResponse>("/profitability");

  return {
    income: Number(summary.income),
    digitalIncome: Number(summary.digitalIncome),
    expenses: Number(summary.expenses),
    contributions: Number(summary.contributions),
    withdrawals: Number(summary.withdrawals),
    inventoryValue: Number(summary.inventoryValue),
    result: Number(summary.result),
    unvaluedProducts: Number(summary.unvaluedProducts),
    unvaluedUnits: Number(summary.unvaluedUnits),
  };
}
