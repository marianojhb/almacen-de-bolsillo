import { useCallback } from "react";
import { Pressable, Text, View, FlatList } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSales } from "@/contexts/sales";

export default function SalesScreen() {
  const { refreshSales, totalSales, sales, isLoadingSales } = useSales();

  useFocusEffect(
    useCallback(() => {
      void refreshSales();
    }, [refreshSales]),
  );

  return (
    <>
      {isLoadingSales && (
        <View className="flex-1 p-4">
          <Text className="text-[20px] dark:text-white">Cargando ventas...</Text>
        </View>
      )}
      {!isLoadingSales && sales.length === 0 && (
        <View className="flex-1 p-4">
          <Text className="text-[20px] dark:text-white">No hay ventas...</Text>
        </View>
      )}
      {!isLoadingSales && sales.length > 0 && (
        <View className="flex-1 p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold">Ventas totales: ${totalSales.toLocaleString("es-AR")}</Text>
          </View>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold">Listado de ventas</Text>
          </View>

          <View className="flex-1">
            <FlatList
              ItemSeparatorComponent={() => <View className="h-2" />}
              data={sales}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item: sale }) => (
                <Pressable key={sale.id} className="flex-row bg-blue-500 p-2 rounded-lg items-center">
                  <Text className=" text-white text-sm me-3">Venta Nº{sale.id}</Text>
                  <Text className="flex-1  text-white text-sm" numberOfLines={1} ellipsizeMode="clip">
                    ..................................................................
                  </Text>
                  <Text className="ms-3  text-white text-sm">
                    {new Date(sale.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </Text>
                  <Text className="ms-3  text-white text-sm">
                    {new Date(sale.createdAt).toLocaleTimeString("es-AR", { hour: "numeric", minute: "numeric" })}
                  </Text>
                  <Text className="ms-3  text-white text-sm">{sale.invoice}</Text>
                  <Text className="ms-3  text-white text-sm">
                    {sale.paymentMethod === "EFECTIVO" ? "EFT" : sale.paymentMethod === "MERCADOPAGO" ? "MP" : "UAL"}
                  </Text>
                  <Text className="ms-3  text-white text-sm">${sale.total.toLocaleString("es-AR")}</Text>
                </Pressable>
              )}
            />
          </View>

          <View className="items-center mb-4 ">
            <Pressable
              className="w-full items-center rounded-xl bg-[#111A1A] p-4 active:opacity-75"
              onPress={() => {
                router.push("/sales/new");
              }}>
              <Text className="text-base font-semibold text-white">Crear nueva venta</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
}
