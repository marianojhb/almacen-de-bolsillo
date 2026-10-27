import { Ionicons } from "@expo/vector-icons";
import type { ProfitabilitySummaryDto } from "@almacen/shared";
import { Redirect, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { NotebookHeading } from "@/components/ui/notebook";
import { useAuth } from "@/contexts/AuthContext";
import { getProfitabilityRequest } from "@/services/profitabilityApi";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

type SummaryRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  value: number;
  operation: "add" | "subtract";
};

function SummaryRow({ icon, label, description, value, operation }: SummaryRowProps) {
  const isAddition = operation === "add";

  return (
    <View className="flex-row items-center gap-3 border-b border-slate-200 py-4 dark:border-slate-800">
      <View className={`h-10 w-10 items-center justify-center rounded-xl ${isAddition ? "bg-emerald-100 dark:bg-emerald-950/60" : "bg-red-100 dark:bg-red-950/60"}`}>
        <Ionicons name={icon} size={21} color={isAddition ? "#047857" : "#dc2626"} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-black text-ink dark:text-white">{label}</Text>
        <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</Text>
      </View>
      <Text
        selectable
        className={`text-right text-sm font-black ${isAddition ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>
        {isAddition ? "+" : "−"}{formatCurrency(value)}
      </Text>
    </View>
  );
}

export default function ProfitabilityScreen() {
  const { user } = useAuth();
  const isOwner = user?.role === "BUSINESS_OWNER";
  const [summary, setSummary] = useState<ProfitabilitySummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadProfitability = useCallback(async () => {
    if (!isOwner) return;

    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await getProfitabilityRequest();
      if (currentRequest === requestId.current) setSummary(result);
    } catch (failure) {
      if (currentRequest === requestId.current) {
        setError(failure instanceof Error ? failure.message : "No se pudo calcular la rentabilidad.");
      }
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false);
    }
  }, [isOwner]);

  useFocusEffect(useCallback(() => {
    void loadProfitability();
    return () => { requestId.current += 1; };
  }, [loadProfitability]));

  if (!isOwner) return <Redirect href="/" />;

  if (isLoading && !summary) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#047857" />
        <Text className="mt-4 text-base font-bold text-slate-700 dark:text-slate-200">Calculando el resultado del negocio...</Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View className="flex-1 items-center justify-center px-5">
        <View className="w-full rounded-[28px] border border-red-100 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/30">
          <Ionicons name="cloud-offline-outline" size={28} color="#dc2626" />
          <Text className="mt-3 text-xl font-black text-red-800 dark:text-red-200">No pudimos calcular la rentabilidad</Text>
          <Text selectable className="mt-2 text-sm leading-5 text-red-700 dark:text-red-300">
            {error ?? "Revisá la conexión con el servidor y volvé a intentar."}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reintentar cálculo de rentabilidad"
            className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-red-700 px-4 active:opacity-80"
            onPress={() => void loadProfitability()}>
            <Text className="font-black text-white">Reintentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isPositive = summary.result >= 0;

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void loadProfitability()} tintColor="#047857" />}
      contentContainerClassName="gap-4 px-4 pb-10 pt-4">
      <NotebookHeading subtitle="Movimientos históricos y mercadería disponible a valores corrientes">
        Rentabilidad
      </NotebookHeading>

      <View className={`overflow-hidden rounded-[28px] p-5 ${isPositive ? "bg-ink dark:bg-slate-950" : "bg-red-800 dark:bg-red-950"}`}>
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className={`text-sm font-bold ${isPositive ? "text-emerald-300" : "text-red-200"}`}>Resultado estimado</Text>
            <Text selectable adjustsFontSizeToFit numberOfLines={1} className="mt-2 text-4xl font-black text-white">
              {formatCurrency(summary.result)}
            </Text>
          </View>
          <View className={`h-12 w-12 items-center justify-center rounded-2xl ${isPositive ? "bg-emerald-300" : "bg-red-200"}`}>
            <Ionicons name={isPositive ? "trending-up-outline" : "trending-down-outline"} size={25} color={isPositive ? "#111A1A" : "#991b1b"} />
          </View>
        </View>
        <Text className="mt-5 text-xs leading-5 text-slate-300">
          Es una referencia general basada en los registros acumulados; no reemplaza un estado contable.
        </Text>
      </View>

      {error ? (
        <View className="flex-row items-start gap-3 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/30">
          <Ionicons name="warning-outline" size={21} color="#b45309" />
          <Text selectable className="flex-1 text-sm font-semibold text-amber-800 dark:text-amber-200">
            {error} Se muestran los últimos valores disponibles.
          </Text>
        </View>
      ) : null}

      <View>
        <Text className="font-handwriting text-2xl font-bold text-ink dark:text-white">Cómo se compone</Text>
        <View className="mt-2">
          <SummaryRow icon="arrow-up-circle-outline" label="Ventas en efectivo" description="Ventas activas registradas" value={summary.income} operation="add" />
          <SummaryRow icon="card-outline" label="Cobros digitales" description="Ventas activas con Mercado Pago y Ualá" value={summary.digitalIncome} operation="add" />
          <SummaryRow icon="arrow-down-circle-outline" label="Egresos" description="Salidas de cierres regulares" value={summary.expenses} operation="subtract" />
          <SummaryRow icon="add-circle-outline" label="Aportes" description="Capital incorporado por el dueño" value={summary.contributions} operation="subtract" />
          <SummaryRow icon="remove-circle-outline" label="Retiros" description="Capital retirado por el dueño" value={summary.withdrawals} operation="add" />
          <SummaryRow icon="cube-outline" label="Mercadería en stock" description="Stock actual al mejor costo disponible" value={summary.inventoryValue} operation="add" />
        </View>
      </View>

      {summary.unvaluedProducts > 0 ? (
        <View className="flex-row items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
          <Ionicons name="pricetag-outline" size={22} color="#b45309" />
          <View className="flex-1">
            <Text className="text-sm font-black text-amber-900 dark:text-amber-100">Hay stock sin valuar</Text>
            <Text selectable className="mt-1 text-sm leading-5 text-amber-800 dark:text-amber-200">
              {summary.unvaluedProducts} {summary.unvaluedProducts === 1 ? "producto activo no tiene" : "productos activos no tienen"} un precio utilizable en proveedores activos. Quedaron fuera {summary.unvaluedUnits} unidades.
            </Text>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center gap-3 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
          <Ionicons name="checkmark-circle-outline" size={22} color="#047857" />
          <Text className="flex-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">Todo el stock activo pudo valuarse.</Text>
        </View>
      )}
    </ScrollView>
  );
}
