import { Ionicons } from "@expo/vector-icons";
import { router, type Href, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View, useColorScheme } from "react-native";
import { useProducts } from "@/contexts/products";
import { usePurchases } from "@/contexts/purchases";
import { useSales } from "@/contexts/sales";
import { Permission } from "@/components/auth/Permission";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { NotebookHeading } from "@/components/ui/notebook";

type FinancialRecord = {
  createdAt: string;
  total: number;
  isActive: boolean;
};

type PeriodSummary = {
  label: string;
  income: number;
  outcome: number;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfWeek = (date: Date) => {
  const result = startOfDay(date);
  const daysSinceMonday = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - daysSinceMonday);
  return result;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const isWithinPeriod = (dateValue: string, from: Date, to: Date) => {
  const date = new Date(dateValue);
  return date >= from && date < to;
};

const sumRecords = (records: FinancialRecord[], from: Date, to: Date) =>
  records.reduce(
    (total, record) =>
      record.isActive && isWithinPeriod(record.createdAt, from, to) ? total + Number(record.total) : total,
    0,
  );

function Dashboard() {
  const isDark = useColorScheme() === "dark";
  const { user } = useAuth();
  const { can } = usePermissions();
  const { products, productsError, refreshProducts } = useProducts();
  const { sales, errorSaleOrders, refreshSales } = useSales();
  const { purchases, errorPurchases, refreshPurchases } = usePurchases();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isOwner = user?.role === "BUSINESS_OWNER";
  const canReadProducts = can("products", "read");

  const refreshDashboard = useCallback(async () => {
    const requests = [refreshSales()];

    if (canReadProducts) requests.push(refreshProducts());
    if (isOwner) requests.push(refreshPurchases());

    await Promise.all(requests);
  }, [canReadProducts, isOwner, refreshProducts, refreshPurchases, refreshSales]);

  useFocusEffect(
    useCallback(() => {
      void refreshDashboard();
    }, [refreshDashboard]),
  );

  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const activeSales = useMemo(() => sales.filter((sale) => sale.isActive), [sales]);
  const activePurchases = useMemo(() => purchases.filter((purchase) => purchase.isActive), [purchases]);

  const todaySales = activeSales
    .filter((sale) => isWithinPeriod(sale.createdAt, today, tomorrow))
    .sort(
      (firstSale, secondSale) => new Date(secondSale.createdAt).getTime() - new Date(firstSale.createdAt).getTime(),
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
  const productsBelowMinimumCount = lowStockProducts.filter((product) => product.stock < product.stockMin).length;

  const firstChartDay = addDays(today, -6);
  const weeklyEvolution = Array.from({ length: 7 }, (_, index) => {
    const dayStart = addDays(firstChartDay, index);
    const dayEnd = addDays(dayStart, 1);

    return {
      key: dayStart.toISOString(),
      label: dayStart.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "").slice(0, 2).toUpperCase(),
      income: sumRecords(activeSales, dayStart, dayEnd),
      outcome: sumRecords(activePurchases, dayStart, dayEnd),
      isToday: dayStart.getTime() === today.getTime(),
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
  const weeklyMaximum = Math.max(1, ...weeklyEvolution.flatMap((day) => [day.income, day.outcome]));
  const dashboardError =
    errorSaleOrders || (canReadProducts ? productsError : null) || (isOwner ? errorPurchases : null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDashboard();
    setIsRefreshing(false);
  };

  return (
    <View className="flex-1 bg-transparent">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#047857" />}>
        <NotebookHeading subtitle={now.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}>
          El día en el almacén
        </NotebookHeading>
        {isOwner && (
          <View className="py-1">
            <Text className="text-lg font-black uppercase tracking-[1.4px] text-ink dark:text-white">
              Ventas del día
            </Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-5xl font-black text-ink dark:text-white">{formatCurrency(todayIncome)}</Text>
              <Ionicons name="storefront-outline" size={44} color={isDark ? "#F0EADB" : "#111A1A"} />
            </View>
            <Text className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              {todaySales.length} {todaySales.length === 1 ? "venta registrada" : "ventas registradas"}
            </Text>

            <View className="mt-4 flex-row border-y border-slate-300 py-3 dark:border-slate-700">
              <View className="flex-1 flex-row items-center gap-2 pr-3">
                <Ionicons name="arrow-up-circle-outline" size={20} color={isDark ? "#91BC93" : "#2F6747"} />
                <View>
                  <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300">Ingresos</Text>
                  <Text className="text-sm font-black text-ink dark:text-white">{formatCurrency(todayIncome)}</Text>
                </View>
              </View>
              <View className="flex-1 flex-row items-center gap-2 border-l border-slate-300 pl-3 dark:border-slate-700">
                <Ionicons name="arrow-down-circle-outline" size={20} color={isDark ? "#ED9D83" : "#C85840"} />
                <View>
                  <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300">Egresos</Text>
                  <Text className="text-sm font-black text-ink dark:text-white">{formatCurrency(todayOutcome)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

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
          <Text className="mb-3 font-handwriting text-2xl font-bold text-ink dark:text-white">Acciones rápidas</Text>
          <View className="flex-row flex-wrap gap-2 mb-2">
            <Permission resource="sales" action="create">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Nueva venta"
                className="min-h-14 min-w-[46%] flex-1 flex-row items-center gap-3 rounded-xl border border-slate-300  px-3 py-4 bg-white/60 active:opacity-70 dark:border-slate-700 dark:bg-slate-950"
                onPress={() => router.push("/(tabs)/sales/new")}>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <Ionicons name="cart-outline" size={20} color="#173F30" />
                </View>
                <Text className="text-lg  font-black text-ink dark:text-white">Nueva Venta</Text>
              </Pressable>
            </Permission>
          </View>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir Caja"
              className="min-h-14 min-w-[46%] flex-1 flex-row items-center gap-3 rounded-xl border border-slate-300  px-3 py-2 active:opacity-70 dark:border-slate-700 dark:bg-slate-950"
              onPress={() => router.push("/more/cash-closing" as Href)}>
              <View className="h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                <Ionicons name="calculator-outline" size={20} color="#173F30" />
              </View>
              <Text className="text-sm font-black text-ink dark:text-white">Caja</Text>
            </Pressable>
            <Permission resource="purchases" action="create">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Nueva compra"
                className="min-h-14 min-w-[46%] flex-1 flex-row items-center gap-3 rounded-xl border border-slate-300  px-3 py-2 active:opacity-70 dark:border-slate-700 dark:bg-slate-950"
                onPress={() => router.push("/(tabs)/purchases/new")}>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-red-50">
                  <Ionicons name="basket-outline" size={20} color="#C85840" />
                </View>
                <Text className="text-sm font-black text-ink dark:text-white">Compra</Text>
              </Pressable>
            </Permission>
            {isOwner && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ver productos"
                className="min-h-14 min-w-[46%] flex-1 flex-row items-center gap-3 rounded-xl border border-slate-300  px-3 py-2 active:opacity-70 dark:border-slate-700 dark:bg-slate-950"
                onPress={() => router.push("/(tabs)/products")}>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                  <Ionicons name="cube-outline" size={20} color="#173F30" />
                  {productsBelowMinimumCount > 0 && (
                    <View
                      accessible
                      accessibilityLabel={`${productsBelowMinimumCount} productos por debajo del stock mínimo`}
                      className="absolute -right-1 -top-1 min-w-4 items-center rounded-full bg-pencil px-1">
                      <Text className="text-[10px] font-black text-white">{productsBelowMinimumCount}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm font-black text-ink dark:text-white">Productos</Text>
              </Pressable>
            )}
          </View>
        </View>

        {isOwner && (
          <View className=" border-slate-200  p-4 dark:border-slate-800 dark:bg-slate-950">
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
        )}

        {isOwner && (
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
                    className="border-b border-slate-200  p-4 dark:border-slate-800 dark:bg-slate-950">
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
                      <View className="flex-1 rounded-2xl  px-3 py-3 dark:bg-amber-950/30">
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
        )}

        {canReadProducts && (
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
                      key={product.id}
                      className="flex-row items-center gap-3 rounded-2xl bg-slate-50 p-3 active:opacity-75 dark:bg-slate-900"
                      onPress={() =>
                        router.push(
                          {
                            pathname: "/(tabs)/products/[id]",
                            params: { id: String(product.id) },
                          },
                          { withAnchor: true },
                        )
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
                        <Ionicons name="chevron-forward" size={17} color="#94a3b8" />
                      </View>
                    </Pressable>
                  );
                })}

                {lowStockProducts.length > 5 && (
                  <Pressable
                    className="items-center rounded-2xl border border-slate-200 py-3 active:opacity-75 dark:border-slate-700"
                    onPress={() => router.push("/(tabs)/products")}>
                    <Text className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                      Ver {lowStockProducts.length - 5} alertas más
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}

        <View className="rounded-[26px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <View className="flex-row items-center justify-between gap-3">
            <View>
              <Text className="text-lg font-black text-slate-950 dark:text-white">Ventas de hoy</Text>
              <Text className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Últimos movimientos del turno
              </Text>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/sales")}>
              <Text className="text-xs font-black uppercase tracking-[1px] text-emerald-700 dark:text-emerald-300">
                Ver todas
              </Text>
            </Pressable>
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
                  key={sale.id}
                  className="flex-row items-center gap-3 rounded-2xl bg-slate-50 p-3 active:opacity-75 dark:bg-slate-900"
                  onPress={() => router.push({ pathname: "/(tabs)/sales/[id]", params: { id: String(sale.id) } })}>
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
                    <Ionicons name="receipt-outline" size={19} color="#047857" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-black text-slate-950 dark:text-white">Venta Nº{sale.id}</Text>
                    <Text className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(sale.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
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
  return <Dashboard />;
}
