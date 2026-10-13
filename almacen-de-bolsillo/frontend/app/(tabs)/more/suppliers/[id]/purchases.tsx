import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { usePurchases } from "@/contexts/purchases";
import { useSuppliers } from "@/contexts/suppliers";

const currency = (value: number) => Number(value).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export default function SupplierPurchasesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const supplierId = Number(id);
  const { suppliers, isLoadingSuppliers, suppliersError, refreshSuppliers } = useSuppliers();
  const { purchases, isLoadingPurchases, errorPurchases, refreshPurchases } = usePurchases();
  const supplier = suppliers.find((item) => item.id === supplierId);
  const supplierPurchases = useMemo(() => purchases
    .filter((purchase) => purchase.supplierId === supplierId)
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()), [purchases, supplierId]);
  const total = supplierPurchases.reduce((sum, purchase) => sum + Number(purchase.total), 0);
  const loading = isLoadingPurchases || isLoadingSuppliers;
  const error = errorPurchases || suppliersError;
  async function refresh() {
    await Promise.all([refreshPurchases(), refreshSuppliers()]);
  }

  if (!Number.isSafeInteger(supplierId) || supplierId <= 0) {
    return <View className="flex-1 bg-slate-50 p-4 dark:bg-[#071111]"><Text className="text-red-600">Proveedor inválido.</Text></View>;
  }

  return (
    <View className="flex-1 bg-slate-50 px-4 pt-4 dark:bg-[#071111]">
      <FlatList
        data={error ? [] : supplierPurchases}
        keyExtractor={(purchase) => String(purchase.id)}
        contentContainerClassName="gap-3 pb-8"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} />}
        ListHeaderComponent={<View className="mb-2 gap-2 rounded-[28px] bg-[#111A1A] p-5 dark:bg-slate-950">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-300">Compras del proveedor</Text>
          <Text className="text-2xl font-black text-white">{supplier?.name ?? "Proveedor"}</Text>
          {supplier && <Text className="text-sm text-slate-300">CUIT: {supplier.cuit}</Text>}
          {!error && <Text className="text-sm text-slate-300">{supplierPurchases.length} compras · Total {currency(total)}</Text>}
        </View>}
        ListEmptyComponent={loading ? <ActivityIndicator color="#80938A" /> : (
          <View className="gap-3 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-base text-slate-700 dark:text-slate-200">{error ? "No se pudieron cargar las compras del proveedor." : !supplier ? "Proveedor no encontrado." : "Este proveedor todavía no tiene compras asociadas."}</Text>
            {error && <Pressable accessibilityRole="button" onPress={() => void refresh()}><Text className="font-semibold text-blue-600 dark:text-blue-400">Reintentar</Text></Pressable>}
          </View>
        )}
        renderItem={({ item: purchase }) => (
          <Pressable accessibilityRole="button" accessibilityLabel={`Ver compra número ${purchase.id}`} onPress={() => router.push(`/purchases/${purchase.id}` as Href)} className="gap-3 rounded-3xl border border-slate-200 bg-white p-4 active:opacity-75 dark:border-slate-800 dark:bg-slate-950">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-xl font-black text-slate-950 dark:text-white">Compra Nº{purchase.id}</Text>
              <Text className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{currency(purchase.total)}</Text>
            </View>
            <Text className="text-sm text-slate-500 dark:text-slate-400">{new Date(purchase.createdAt).toLocaleString("es-AR")}</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-slate-600 dark:text-slate-300">{purchase.isActive ? "Activa" : "Inactiva"}</Text>
              <View className="flex-row items-center gap-1"><Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">Ver detalle</Text><Ionicons name="chevron-forward" size={18} color="#80938A" /></View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
