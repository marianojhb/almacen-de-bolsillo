import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getCommerceDashboardPeriods, getCommerceDayStart, type DashboardSummary } from "@almacen/shared";
import { useCommerceFormat } from "./use-commerce-format";
import { getDashboardRequest } from "@/services/dashboardApi";
import { usePermissions } from "./use-permissions";

const emptySummary: DashboardSummary = { sales: [], purchases: [], products: [] };

export function useDashboard() {
  const { can } = usePermissions();
  const { timeZone } = useCommerceFormat();
  const loadedDay = useRef<string | null>(null);
  const [summary, setSummary] = useState(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const loadingRequest = useRef<Promise<void> | null>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const refresh = useCallback(async () => {
    if (!can("dashboard.read")) { setSummary(emptySummary); setIsLoading(false); return; }
    if (loadingRequest.current) return loadingRequest.current;
    const request = (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const periods = getCommerceDashboardPeriods(timeZone);
        const from = getCommerceDayStart(periods.from, timeZone);
        const to = getCommerceDayStart(periods.to, timeZone);
        const result = await getDashboardRequest(from, to);
        if (mounted.current) { loadedDay.current = periods.today; setSummary(result); }
      } catch (error) {
        if (mounted.current) setError(error instanceof Error ? error.message : "No se pudo cargar el resumen.");
      } finally {
        if (mounted.current) setIsLoading(false);
      }
    })();
    loadingRequest.current = request;
    try { await request; } finally { if (loadingRequest.current === request) loadingRequest.current = null; }
  }, [can, timeZone]);

  useFocusEffect(useCallback(() => {
    void refresh();
    const timer = setInterval(() => {
      if (can("dashboard.read") && loadedDay.current !== getCommerceDashboardPeriods(timeZone).today) void refresh();
    }, 60000);
    return () => clearInterval(timer);
  }, [can, refresh, timeZone]));
  return { summary, isLoading, error, refresh };
}
