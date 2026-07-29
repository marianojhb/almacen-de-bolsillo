import { useState, useEffect } from "react";
import { SalesOrderWithItems } from "@/types/Sales-Order";
import { Pressable, Text, View, FlatList } from "react-native";
import { router } from "expo-router";
export default function SalesScreen() {
  const [sales, setSales] = useState<SalesOrderWithItems[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);

  useEffect(() => {
    async function fetchSales() {
      const salesFetched = await fetch("http://192.168.0.158:3000/sales-orders/");
      const data = await salesFetched.json();
      setSales(data);
      setTotalSales(data.reduce((acc: number, sale: SalesOrderWithItems) => acc + Number(sale.total), 0));
    }
    fetchSales();
  }, []);

  return (
    <View className="flex-1 p-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-3xl font-bold">Listado de ventas</Text>
      </View>
      <View className="flex-row items-center mb-4 justify-end">
        <Pressable
          className="items-center rounded-xl bg-[#111A1A] px-4 py-2 active:opacity-75"
          onPress={() => {
            router.push("/sales/new");
          }}>
          <Text className="text-base font-semibold text-white">Crear nueva venta</Text>
        </Pressable>
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
    </View>
  );
}
