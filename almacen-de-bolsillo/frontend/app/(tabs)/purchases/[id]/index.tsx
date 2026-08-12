import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import type { PurchaseOrderWithRelationsDto } from "@almacen/shared";
import { FlatList, Text, View, Pressable } from "react-native";
import { getPurchaseByIdRequest } from "@/services/purchasesApi";

export default function PurchaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [purchase, setPurchase] = useState<PurchaseOrderWithRelationsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchase() {
      try {
        setIsLoading(true);
        setPurchase(await getPurchaseByIdRequest(Number(id)));
      } catch (error) {
        console.error("Error fetching purchase details:", error);
        setPurchase(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPurchase();
  }, [id]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-base dark:text-white">Cargando compra...</Text>
      </View>
    );
  }

  if (!purchase) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-base dark:text-white">Compra no encontrada</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Stack.Screen
        options={{
          title: `Compra Nº${id}`,
        }}
      />

      <View className="mb-4 rounded-lg border border-gray-300 p-4 dark:border-gray-700">
        <Text className="text-2xl font-bold dark:text-white">Compra Nº{id}</Text>
        <Text className="mt-2 text-base dark:text-white">
          Total: {Number(purchase.total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
        </Text>
        <Text className="mt-1 text-base dark:text-white">
          Fecha: {new Date(purchase.createdAt).toLocaleString("es-AR")}
        </Text>
        <Text className="mt-1 text-base dark:text-white">
          Proveedor Nº{purchase.supplierId} {purchase.supplier?.name ?? "Proveedor desconocido"}
        </Text>
      </View>

      <Text className="mb-2 text-xl font-bold dark:text-white">Items</Text>
      <FlatList
        data={purchase.purchaseOrdersItems ?? []}
        keyExtractor={(item) => `${item.purchaseOrderId}-${item.productId}`}
        ListEmptyComponent={<Text className="text-gray-500 dark:text-gray-400">No hay items para esta compra.</Text>}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(tabs)/products/[id]",
                params: {
                  id: String(item.productId),
                },
              })
            }
            className=" flex-row items-center justify-between rounded-lg border border-gray-300 p-3 dark:border-gray-700">
            <View className="rounded-lg  ">
              <Text className="font-semibold dark:text-white">
                Id: {item.productId} - {item.product?.shortname ?? "Producto desconocido"}
              </Text>
              <Text className="dark:text-white">Cantidad: {item.quantity}</Text>
              <Text className="dark:text-white">
                Subtotal: {Number(item.subtotal).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
