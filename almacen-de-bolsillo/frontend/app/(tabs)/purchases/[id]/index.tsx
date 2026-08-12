import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import type { PurchaseOrderWithRelationsDto } from "@almacen/shared";
import { Pressable, ScrollView, Text, View } from "react-native";
import { getPurchaseByIdRequest } from "@/services/purchasesApi";

export default function PurchaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [purchase, setPurchase] = useState<PurchaseOrderWithRelationsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorPurchase, setErrorPurchase] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPurchase() {
      try {
        setIsLoading(true);
        setErrorPurchase(null);
        setPurchase(await getPurchaseByIdRequest(Number(id)));
      } catch (error) {
        console.error("Error fetching purchase details:", error);
        setPurchase(null);
        setErrorPurchase("No pudimos cargar la compra solicitada.");
      } finally {
        setIsLoading(false);
      }
    }

    void fetchPurchase();
  }, [id]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Cargando compra...</Text>
          <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Estamos preparando el detalle de la orden.
          </Text>
        </View>
      </View>
    );
  }

  if (!purchase || errorPurchase) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <Stack.Screen
          options={{
            title: "Compras",
          }}
        />
        <View className="w-full rounded-3xl border border-red-100 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/30">
          <Text className="text-center text-xl font-bold text-red-700 dark:text-red-300">Compra no encontrada</Text>
          <Text className="mt-2 text-center text-sm text-red-600 dark:text-red-200">
            {errorPurchase ?? "La compra que buscás no está disponible."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#071111]">
      <Stack.Screen
        options={{
          title: "Compras",
        }}
      />

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-8 pt-4">
        <View className="rounded-[28px] bg-[#111A1A] p-5 dark:bg-slate-950">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-300">Abastecimiento</Text>
              <Text className="mt-1 text-4xl font-black text-white">Compra Nº{purchase.id}</Text>
              <Text className="mt-2 text-sm leading-5 text-slate-300">
                Fecha: {new Date(purchase.createdAt).toLocaleString("es-AR")}
              </Text>
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                Proveedor: {purchase.supplier?.name ?? `Proveedor Nº${purchase.supplierId}`}
              </Text>
            </View>

            <View className="items-end gap-2">
              <View className={`rounded-full px-3 py-1.5 ${purchase.isActive ? "bg-emerald-400" : "bg-slate-500"}`}>
                <Text className="text-xs font-black text-[#111A1A]">{purchase.isActive ? "Activa" : "Inactiva"}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
            Total de la compra
          </Text>
          <Text className="mt-1 text-4xl font-black text-emerald-700 dark:text-emerald-300">
            {Number(purchase.total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
          </Text>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <Text className="mb-4 text-lg font-black text-slate-950 dark:text-white">Detalles</Text>

          <View className="gap-4">
            <View>
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                Identificador
              </Text>
              <Text className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">#{purchase.id}</Text>
            </View>

            <View>
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                Fecha de creación
              </Text>
              <Text className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">
                {new Date(purchase.createdAt).toLocaleString("es-AR")}
              </Text>
            </View>

            <View>
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                Proveedor
              </Text>
              <Text className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">
                {purchase.supplier?.name ?? "Proveedor desconocido"}
              </Text>
            </View>

            <View>
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                Estado
              </Text>
              <Text className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">
                {purchase.isActive ? "Activa" : "Inactiva"}
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <Text className="mb-4 text-lg font-black text-slate-950 dark:text-white">Artículos</Text>

          {purchase.purchaseOrdersItems && purchase.purchaseOrdersItems.length > 0 ? (
            <View className="gap-4">
              {purchase.purchaseOrdersItems.map((item) => (
                <Pressable
                  key={`${item.purchaseOrderId}-${item.productId}`}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/products/[id]",
                      params: {
                        id: String(item.productId),
                      },
                    })
                  }
                  className="rounded-2xl border border-slate-200 p-4 active:opacity-80 dark:border-slate-800">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-lg font-black text-slate-950 dark:text-white">
                        {item.product?.shortname ?? "Producto desconocido"}
                      </Text>
                      <Text className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        #{item.productId}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-xs font-bold uppercase tracking-[1px] text-emerald-600 dark:text-emerald-400">
                        Subtotal
                      </Text>
                      <Text className="text-base font-black text-emerald-700 dark:text-emerald-300">
                        {Number(item.subtotal).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <View className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                      <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">Cantidad: {item.quantity}</Text>
                    </View>
                    <View className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                      <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Unitario: {Number(item.price).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                      </Text>
                    </View>
                    <View className="rounded-full bg-indigo-50 px-3 py-1.5 dark:bg-indigo-950/60">
                      <Text className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Ver producto</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-slate-500 dark:text-slate-400">No hay items para esta compra.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
