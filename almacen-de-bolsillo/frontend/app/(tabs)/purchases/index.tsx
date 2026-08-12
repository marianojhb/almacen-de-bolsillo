import { useState, useEffect } from "react";
import { PurchaseOrderWithRelationsDto } from "@almacen/shared";
import { Pressable, Text, View, FlatList } from "react-native";
import { router } from "expo-router";
import { getPurchaseOrdersRequest } from "@/services/purchasesApi";

const PurchasesScreen = () => {
  const [purchases, setPurchases] = useState<PurchaseOrderWithRelationsDto[]>([]);
  const [totalPurchases, setTotalPurchases] = useState<number>(0);

  useEffect(() => {
    async function fetchPurchases() {
      const data = await getPurchaseOrdersRequest();
      setPurchases(data);
      setTotalPurchases(
        data.reduce((acc: number, purchase: PurchaseOrderWithRelationsDto) => acc + Number(purchase.total), 0),
      );
    }

    fetchPurchases();
  }, []);

  return (
    <View className="flex-1 p-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold">Compras</Text>
        <Text className="text-lg font-bold">
          Total: {Number(totalPurchases).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
        </Text>
      </View>
      <FlatList
        ItemSeparatorComponent={() => <View className="h-2" />}
        data={purchases}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: purchase }) => (
          <Pressable
            className="flex-row bg-blue-500 p-2 rounded-lg items-center"
            onPress={() =>
              router.push({
                pathname: "/(tabs)/purchases/[id]",
                params: { id: String(purchase.id) },
              })
            }>
            <Text className="text-white text-sm me-3">Compra Nº{purchase.id}</Text>
            <Text className="flex-1 text-white text-sm" numberOfLines={1} ellipsizeMode="clip">
              ..................................................................
            </Text>
            <Text className="ms-3 text-white text-sm">
              {new Date(purchase.createdAt).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
              })}
            </Text>
            <Text className="ms-3 text-white text-sm">
              {new Date(purchase.createdAt).toLocaleTimeString("es-AR", { hour: "numeric", minute: "numeric" })}
            </Text>
            <Text className="ms-3 text-white text-sm">
              {Number(purchase.total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
            </Text>
          </Pressable>
        )}
      />
      <View className="items-center mb-4 mt-4">
        <Pressable
          className="w-full items-center rounded-xl bg-[#111A1A] p-4 active:opacity-75"
          onPress={() => router.push("/(tabs)/purchases/new")}>
          <Text className="text-base font-semibold text-white">Crear nueva compra</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default PurchasesScreen;
