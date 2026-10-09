import type { DashboardSummary } from "@almacen/shared";
import { apiFetch } from "./apiClient";

export async function getDashboardRequest(from: Date, to: Date): Promise<DashboardSummary> {
  const query = "from=" + encodeURIComponent(from.toISOString()) + "&to=" + encodeURIComponent(to.toISOString());
  const response = await apiFetch("/dashboard?" + query);
  if (!response.ok) throw new Error("No se pudo cargar el dashboard. Intentá nuevamente.");
  return response.json();
}
