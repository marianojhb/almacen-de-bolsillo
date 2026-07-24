import { useState } from "react";
import { Pressable, Text, View } from "react-native";
export default function SalesScreen() {
  const [sales, setSales] = useState([
    { id: 1, total: 10000 },
    { id: 2, total: 20000 },
    { id: 3, total: 30000 },
  ]);

  return (
    <View className="flex-1 p-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-3xl font-bold">Listado de ventas...</Text>
      </View>

      <View className="gap-2">
        {sales.map((sale) => (
          <Pressable key={sale.id} className="flex-row">
            <Text className="me-3">Venta Nº{sale.id}</Text>
            <Text className="flex-1" numberOfLines={1} ellipsizeMode="clip">
              ..................................................................
            </Text>
            <Text className="ms-3">${sale.total.toLocaleString()}</Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row justify-evenly gap-2 mt-4">
        <Pressable
          onPress={() => {
            console.log("Nueva venta");
          }}
          className="flex w-24 p-4 items-center justify-center bg-green-600 rounded-lg mt-4">
          <Text className="text-center text-white text-lg">Nueva venta</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            console.log(`Nuevo gasto ${new Date().toLocaleTimeString()}`);
          }}
          className="flex w-24 p-4 items-center justify-center bg-red-600 rounded-lg mt-4">
          <Text className="text-center text-white text-lg">Nuevo gasto</Text>
        </Pressable>
      </View>
    </View>
  );
}
