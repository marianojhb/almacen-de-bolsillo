import { addCalendarDays, getCommerceDashboardPeriods } from "@almacen/shared";
import { useCommerceFormat } from "@/hooks/use-commerce-format";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useDashboard } from "@/hooks/use-dashboard";
import { usePermissions } from "@/hooks/use-permissions";



type FinancialRecord = {
  createdAt: string;
  dateKey: string;
  total: number;
  isActive: boolean;
};

type PeriodSummary = {
  label: string;
  income: number;
  outcome: number;
};

const isWithinPeriod = (day: string, from: string, to: string) => day >= from && day < to;

const sumRecords = (records: FinancialRecord[], from: string, to: string) =>
  records.reduce(
    (total, record) =>
      record.isActive && isWithinPeriod(record.dateKey, from, to) ? total + Number(record.total) : total,
    0,
  );

function EmployeeDashboard() {
  const { formatCurrency, formatDate, formatTime, formatCalendarDate, dateKey, timeZone } = useCommerceFormat();
  const { summary: { products, sales, purchases }, isLoading: loading, error: dashboardError, refresh } = useDashboard();
  const { can } = usePermissions();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const now = new Date();
  const { today, tomorrow, weekStart, monthStart, firstChartDay } = getCommerceDashboardPeriods(timeZone, now);

  const activeSales = useMemo(() => sales.filter((sale) => sale.isActive).map((sale) => ({ ...sale, dateKey: dateKey(sale.createdAt) })), [sales, dateKey]);
  const activePurchases = useMemo(() => purchases.filter((purchase) => purchase.isActive).map((purchase) => ({ ...purchase, dateKey: dateKey(purchase.createdAt) })), [purchases, dateKey]);

  const todaySales = activeSales
    .filter((sale) => isWithinPeriod(sale.dateKey, today, tomorrow))
    .sort(
      (firstSale, secondSale) =>
        new Date(secondSale.createdAt).getTime() - new Date(firstSale.createdAt).getTime(),
    );

  const lowStockProducts = useMemo(
    () =>
      products
        .filter((product) => product.isActive && product.stockMin > 0 && product.stock <= product.stockMin)
        .sort((firstProduct, secondProduct) => {
          if (firstProduct.stock === 0 && secondProduct.stock !== 0) return -1;
          if (secondProduct.stock === 0 && firstProduct.stock !== 0) return 1;
          return firstProduct.stock - firstProduct.stockMin - (secondProduct.stock - secondProduct.stockMin);
        }),
    [products],
  );

  const weeklyEvolution = Array.from({ length: 7 }, (_, index) => {
    const dayStart = addCalendarDays(firstChartDay, index);
    const dayEnd = addCalendarDays(dayStart, 1);

    return {
      key: dayStart,
      label: formatCalendarDate(dayStart, { weekday: "short" })
        .replace(".", "")
        .slice(0, 2)
        .toUpperCase(),
      income: sumRecords(activeSales, dayStart, dayEnd),
      outcome: sumRecords(activePurchases, dayStart, dayEnd),
      isToday: dayStart === today,
    };
  });

  const periodSummaries: PeriodSummary[] = [
    {
      label: "Hoy",
      income: sumRecords(activeSales, today, tomorrow),
      outcome: sumRecords(activePurchases, today, tomorrow),
    },
    {
      label: "Semana",
      income: sumRecords(activeSales, weekStart, tomorrow),
      outcome: sumRecords(activePurchases, weekStart, tomorrow),
    },
    {
      label: "Mes",
      income: sumRecords(activeSales, monthStart, tomorrow),
      outcome: sumRecords(activePurchases, monthStart, tomorrow),
    },
  ];

  const todayIncome = periodSummaries[0]?.income ?? 0;
  const todayOutcome = periodSummaries[0]?.outcome ?? 0;
  const weeklyMaximum = Math.max(
    1,
    ...weeklyEvolution.flatMap((day) => [day.income, day.outcome]),
  );


  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#071111]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#047857" />}>
        <View className="overflow-hidden rounded-[30px] bg-[#111A1A] p-5 dark:bg-slate-950">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xs font-black uppercase tracking-[2px] text-emerald-300">Panel del equipo</Text>
              <Text className="mt-2 text-3xl font-black text-white">Resumen de hoy</Text>
              <Text className="mt-1 text-sm font-medium capitalize text-slate-300">
                {formatDate(now, { weekday: "long", day: "numeric", month: "long" })}
              </Text>
            </View>
            {loading ? (
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <ActivityIndicator color="#6ee7b7" />
              </View>
            ) : (
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400">
                <Ionicons name="storefront-outline" size={22} color="#111A1A" />
              </View>
            )}
          </View>

          <View className="mt-6">
            <Text className="text-xs font-bold uppercase tracking-[1.4px] text-slate-400">Ventas del día</Text>
            <Text className="mt-1 text-4xl font-black text-white">{formatCurrency(todayIncome)}</Text>
            <Text className="mt-2 text-sm font-semibold text-emerald-300">
              {todaySales.length} {todaySales.length === 1 ? "venta registrada" : "ventas registradas"}
            </Text>
          </View>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-white/10 p-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="arrow-up-circle-outline" size={17} color="#6ee7b7" />
                <Text className="text-xs font-bold text-slate-300">Ingresos</Text>
              </View>
              <Text className="mt-2 text-base font-black text-white">{formatCurrency(todayIncome)}</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-white/10 p-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="arrow-down-circle-outline" size={17} color="#fbbf24" />
                <Text className="text-xs font-bold text-slate-300">Egresos</Text>
              </View>
              <Text className="mt-2 text-base font-black text-white">{formatCurrency(todayOutcome)}</Text>
            </View>
          </View>
        </View>

        {dashboardError && (
          <View className="flex-row items-center gap-3 rounded-3xl border border-red-100 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30">
            <Ionicons name="cloud-offline-outline" size={22} color="#dc2626" />
            <View className="flex-1">
              <Text className="text-sm font-black text-red-700 dark:text-red-300">Hay datos sin actualizar</Text>
              <Text className="mt-1 text-xs text-red-600 dark:text-red-200">Deslizá hacia abajo para reintentar.</Text>
            </View>
          </View>
        )}

        <View>
          <View className="mb-3 flex-row items-end justify-between">
            <View>
              <Text className="text-lg font-black text-slate-950 dark:text-white">Acciones rápidas</Text>
              <Text className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">Tareas frecuentes del turno</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <PermissionGate permission="sales.create"><Pressable
              className="flex-1 rounded-[22px] bg-emerald-700 p-4 active:opacity-80 dark:bg-emerald-600"
              onPress={() => router.push("/(tabs)/sales/new")}>
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <Ionicons name="cart-outline" size={21} color="white" />
              </View>
              <Text className="mt-4 text-sm font-black text-white">Nueva venta</Text>
              <Text className="mt-1 text-xs text-emerald-100">Registrar cobro</Text>
            </Pressable></PermissionGate>
            <PermissionGate permission="purchases.create"><Pressable
              className="flex-1 rounded-[22px] border border-slate-200 bg-white p-4 active:opacity-80 dark:border-slate-800 dark:bg-slate-950"
              onPress={() => router.push("/(tabs)/purchases/new")}>
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40">
                <Ionicons name="basket-outline" size={21} color="#b45309" />
              </View>
              <Text className="mt-4 text-sm font-black text-slate-950 dark:text-white">Nueva compra</Text>
              <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">Reponer stock</Text>
            </Pressable></PermissionGate>
            <PermissionGate permission="products.read"><Pressable
              className="flex-1 rounded-[22px] border border-slate-200 bg-white p-4 active:opacity-80 dark:border-slate-800 dark:bg-slate-950"
              onPress={() => router.push("/(tabs)/products")}>
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
                <Ionicons name="cube-outline" size={21} color="#64748b" />
              </View>
              <Text className="mt-4 text-sm font-black text-slate-950 dark:text-white">Productos</Text>
              <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ver inventario</Text>
            </Pressable></PermissionGate>
          </View>
        </View>

        <View className="rounded-[26px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-lg font-black text-slate-950 dark:text-white">Evolución semanal</Text>
              <Text className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Últimos 7 días</Text>
            </View>
            <View className="items-end gap-1">
              <View className="flex-row items-center gap-1.5">
                <View className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Ingresos</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Egresos</Text>
              </View>
            </View>
          </View>

          <View className="mt-5 h-36 flex-row items-end justify-between border-b border-slate-200 dark:border-slate-800">
            {weeklyEvolution.map((day) => {
              const incomeHeight = day.income > 0 ? Math.max(5, (day.income / weeklyMaximum) * 108) : 2;
              const outcomeHeight = day.outcome > 0 ? Math.max(5, (day.outcome / weeklyMaximum) * 108) : 2;

              return (
                <View key={day.key} className="h-full flex-1 items-center justify-end">
                  <View className="flex-1 flex-row items-end gap-1">
                    <View className="w-2.5 rounded-t-full bg-emerald-500" style={{ height: incomeHeight }} />
                    <View className="w-2.5 rounded-t-full bg-amber-400" style={{ height: outcomeHeight }} />
                  </View>
                  <Text
                    className={`mb-2 mt-2 text-[10px] font-black ${
                      day.isToday ? "text-emerald-700 dark:text-emerald-300" : "text-slate-400 dark:text-slate-500"
                    }`}>
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View>
          <View className="mb-3">
            <Text className="text-lg font-black text-slate-950 dark:text-white">Ingresos y egresos</Text>
            <Text className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              Balance operativo por período
            </Text>
          </View>
          <View className="gap-3">
            {periodSummaries.map((period) => {
              const balance = period.income - period.outcome;

              return (
                <View
                  key={period.label}
                  className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-black text-slate-950 dark:text-white">{period.label}</Text>
                    <Text
                      className={`text-sm font-black ${
                        balance >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-300"
                      }`}>
                      {balance >= 0 ? "+" : ""}
                      {formatCurrency(balance)}
                    </Text>
                  </View>
                  <View className="mt-3 flex-row gap-3">
                    <View className="flex-1 rounded-2xl bg-emerald-50 px-3 py-3 dark:bg-emerald-950/30">
                      <Text className="text-[10px] font-black uppercase tracking-[1px] text-emerald-600 dark:text-emerald-400">
                        Ingresos
                      </Text>
                      <Text className="mt-1 text-sm font-black text-emerald-800 dark:text-emerald-200">
                        {formatCurrency(period.income)}
                      </Text>
                    </View>
                    <View className="flex-1 rounded-2xl bg-amber-50 px-3 py-3 dark:bg-amber-950/30">
                      <Text className="text-[10px] font-black uppercase tracking-[1px] text-amber-600 dark:text-amber-400">
                        Egresos
                      </Text>
                      <Text className="mt-1 text-sm font-black text-amber-800 dark:text-amber-200">
                        {formatCurrency(period.outcome)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View className="rounded-[26px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-lg font-black text-slate-950 dark:text-white">Alertas de stock</Text>
              <Text className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Productos en mínimo o por debajo
              </Text>
            </View>
            <View
              className={`rounded-full px-3 py-1.5 ${
                lowStockProducts.length > 0 ? "bg-red-50 dark:bg-red-950/40" : "bg-emerald-50 dark:bg-emerald-950/40"
              }`}>
              <Text
                className={`text-xs font-black ${
                  lowStockProducts.length > 0
                    ? "text-red-600 dark:text-red-300"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}>
                {lowStockProducts.length}
              </Text>
            </View>
          </View>

          {lowStockProducts.length === 0 ? (
            <View className="mt-4 flex-row items-center gap-3 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
              <Ionicons name="checkmark-circle-outline" size={23} color="#059669" />
              <Text className="flex-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                El inventario está por encima de sus mínimos.
              </Text>
            </View>
          ) : (
            <View className="mt-4 gap-2">
              {lowStockProducts.slice(0, 5).map((product) => {
                const missingUnits = Math.max(product.stockMin - product.stock, 0);
                const isOutOfStock = product.stock === 0;

                return (
                  <Pressable
                    disabled={!can("products.read")}
                    key={product.id}
                    className="flex-row items-center gap-3 rounded-2xl bg-slate-50 p-3 active:opacity-75 dark:bg-slate-900"
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/products/[id]",
                        params: { id: String(product.id) },
                      })
                    }>
                    <View
                      className={`h-10 w-10 items-center justify-center rounded-2xl ${
                        isOutOfStock ? "bg-red-100 dark:bg-red-950/60" : "bg-amber-100 dark:bg-amber-950/60"
                      }`}>
                      <Ionicons
                        name={isOutOfStock ? "close-circle-outline" : "alert-circle-outline"}
                        size={21}
                        color={isOutOfStock ? "#dc2626" : "#b45309"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-black text-slate-950 dark:text-white">{product.shortname}</Text>
                      <Text className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        Stock {product.stock} · Mínimo {product.stockMin}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text
                        className={`text-xs font-black ${
                          isOutOfStock ? "text-red-600 dark:text-red-300" : "text-amber-600 dark:text-amber-300"
                        }`}>
                        {isOutOfStock ? "Sin stock" : missingUnits > 0 ? `Faltan ${missingUnits}` : "En mínimo"}
                      </Text>
                      {can("products.read") && <Ionicons name="chevron-forward" size={17} color="#94a3b8" />}
                    </View>
                  </Pressable>
                );
              })}

              {lowStockProducts.length > 5 && (
                <PermissionGate permission="products.read"><Pressable
                  className="items-center rounded-2xl border border-slate-200 py-3 active:opacity-75 dark:border-slate-700"
                  onPress={() => router.push("/(tabs)/products")}>
                  <Text className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                    Ver {lowStockProducts.length - 5} alertas más
                  </Text>
                </Pressable></PermissionGate>
              )}
            </View>
          )}
        </View>

        <View className="rounded-[26px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <View className="flex-row items-center justify-between gap-3">
            <View>
              <Text className="text-lg font-black text-slate-950 dark:text-white">Ventas de hoy</Text>
              <Text className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Últimos movimientos del turno</Text>
            </View>
            <PermissionGate permission="sales.read"><Pressable onPress={() => router.push("/(tabs)/sales")}>
              <Text className="text-xs font-black uppercase tracking-[1px] text-emerald-700 dark:text-emerald-300">
                Ver todas
              </Text>
            </Pressable></PermissionGate>
          </View>

          {todaySales.length === 0 ? (
            <View className="mt-4 items-center rounded-2xl bg-slate-50 px-4 py-7 dark:bg-slate-900">
              <Ionicons name="receipt-outline" size={25} color="#94a3b8" />
              <Text className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                Todavía no se registraron ventas hoy.
              </Text>
            </View>
          ) : (
            <View className="mt-4 gap-2">
              {todaySales.slice(0, 4).map((sale) => (
                <Pressable
                  disabled={!can("sales.read")}
                  key={sale.id}
                  className="flex-row items-center gap-3 rounded-2xl bg-slate-50 p-3 active:opacity-75 dark:bg-slate-900"
                  onPress={() =>
                    router.push({ pathname: "/(tabs)/sales/[id]", params: { id: String(sale.id) } })
                  }>
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
                    <Ionicons name="receipt-outline" size={19} color="#047857" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-black text-slate-950 dark:text-white">Venta Nº{sale.id}</Text>
                    <Text className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {formatTime(sale.createdAt)}
                    </Text>
                  </View>
                  <Text className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(Number(sale.total))}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  return <EmployeeDashboard />;
}
