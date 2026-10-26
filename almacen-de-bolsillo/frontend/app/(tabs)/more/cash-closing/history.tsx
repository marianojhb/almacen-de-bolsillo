import { Ionicons } from "@expo/vector-icons";
import type { BalanceHistoryDto } from "@almacen/shared";
import { formatFullName } from "@almacen/shared";
import { Redirect, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { getBalanceHistoryRequest } from "@/services/balancesApi";

const currencyFormatter = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" });

function BalanceHistoryCard({ balance }: { balance: BalanceHistoryDto }) {
  const employee = balance.employee;
  const name = formatFullName(employee?.firstname, employee?.lastname) || employee?.fullname;
  const email = employee?.user?.email;
  const responsible = name || email || "Usuario no registrado";
  const hasDifference = balance.difference !== 0;

  return (
    <View className="rounded-[26px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">Cierre #{balance.id}</Text>
          <Text className="mt-1 text-base font-black text-slate-950 dark:text-white">
            {dateFormatter.format(new Date(balance.date))}
          </Text>
        </View>
        <Ionicons name={hasDifference ? "alert-circle-outline" : "checkmark-circle-outline"} size={24} color={hasDifference ? "#dc2626" : "#059669"} />
      </View>
      <View className="mt-4 flex-row items-start gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
        <Ionicons name="person-outline" size={18} color="#64748b" />
        <View className="flex-1">
          <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cerrada por</Text>
          <Text selectable className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{responsible}</Text>
          {name && email ? <Text selectable className="mt-1 text-xs text-slate-500 dark:text-slate-400">{email}</Text> : null}
        </View>
      </View>
      <View className="mt-4 flex-row gap-3">
        <View className="flex-1">
          <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Esperado</Text>
          <Text selectable className="mt-1 text-base font-black text-slate-950 dark:text-white">{currencyFormatter.format(balance.expectedClosing)}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Efectivo real</Text>
          <Text selectable className="mt-1 text-base font-black text-slate-950 dark:text-white">{currencyFormatter.format(balance.actualClosing)}</Text>
        </View>
      </View>
      <View className={`mt-4 rounded-2xl p-3 ${hasDifference ? "bg-red-50 dark:bg-red-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"}`}>
        <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">Diferencia</Text>
        <Text selectable className={`mt-1 text-lg font-black ${hasDifference ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>
          {currencyFormatter.format(balance.difference)}
        </Text>
      </View>
    </View>
  );
}

export default function CashClosingHistoryScreen() {
  const { user } = useAuth();
  const isOwner = user?.role === "BUSINESS_OWNER";
  const [balances, setBalances] = useState<BalanceHistoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadHistory = useCallback(async () => {
    if (!isOwner) return;
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const records = await getBalanceHistoryRequest();
      if (currentRequest === requestId.current) setBalances(records);
    } catch (failure) {
      if (currentRequest === requestId.current) {
        setError(failure instanceof Error ? failure.message : "No se pudo cargar el historial.");
      }
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false);
    }
  }, [isOwner]);

  useFocusEffect(useCallback(() => {
    void loadHistory();
    return () => { requestId.current += 1; };
  }, [loadHistory]));

  if (!isOwner) return <Redirect href="/more/cash-closing" />;

  return (
    <FlatList
      className="flex-1 bg-transparent"
      contentContainerClassName="gap-3 px-4 pb-8 pt-4"
      data={balances}
      keyExtractor={(balance) => String(balance.id)}
      renderItem={({ item }) => <BalanceHistoryCard balance={item} />}
      refreshing={isLoading}
      onRefresh={() => void loadHistory()}
      ListHeaderComponent={
        <View className="mb-1">
          <Text className="text-lg font-black text-slate-950 dark:text-white">Cierres registrados</Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">Del más reciente al más antiguo</Text>
          {error ? (
            <View className="mt-4 rounded-2xl bg-red-50 p-4 dark:bg-red-950/30">
              <Text className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</Text>
              <Pressable accessibilityRole="button" onPress={() => void loadHistory()} className="mt-2 min-h-11 justify-center active:opacity-70">
                <Text className="font-black text-red-700 dark:text-red-300">Reintentar</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={isLoading ? (
        <View className="items-center gap-3 py-12"><ActivityIndicator color="#059669" /><Text className="text-sm text-slate-500 dark:text-slate-400">Cargando cierres...</Text></View>
      ) : !error ? (
        <View className="items-center rounded-3xl bg-white px-5 py-10 dark:bg-slate-950">
          <Ionicons name="time-outline" size={32} color="#64748b" />
          <Text className="mt-3 text-base font-bold text-slate-950 dark:text-white">Todavía no hay cierres</Text>
          <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">Los cierres que registres desde Caja aparecerán acá.</Text>
        </View>
      ) : undefined}
    />
  );
}
