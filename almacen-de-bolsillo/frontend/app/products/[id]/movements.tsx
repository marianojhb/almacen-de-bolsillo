import { useLocalSearchParams } from "expo-router";
import { useProducts } from "@/contexts/useProducts";
import { View, Text, FlatList } from "react-native";
import { movements } from "@/data/movements";

export default function StockMovementsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useProducts();
  const filteredProducts = movements.filter((product) => product.productId === Number(id));
  const product = products.find((currentProduct) => currentProduct.id === Number(id));

  if (filteredProducts.length === 0) {
    return (
      <View className="flex-1 p-4">
        <Text className="text-[20px] dark:text-white">Producto no encontrado.</Text>
      </View>
    );
  }
  return (
    <View>
      <Text className="text-lg font-bold dark:text-white px-1 py-3 ">Movimientos de Producto: {product?.name}</Text>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="flex-row justify-between p-1 border-b border-gray-300 py-2 dark:border-gray-700 items-center  ">
            <Text numberOfLines={1} className="w-24 shrink-0 text-sm dark:text-white">
              {item.date.toLocaleDateString()}
            </Text>
            <Text numberOfLines={1} className="w-12 shrink-0 text-center text-sm dark:text-white">
              {item.quantity}
            </Text>
            <Text className="flex-1 min-w-0 px-2 text-sm dark:text-white">
              {item.reason ?? "Sin motivo"}
            </Text>
            <View className="w-20 shrink-0 items-end">
              <Text
                numberOfLines={1}
                className={`h-8 rounded-lg border border-gray-300 px-2 py-2 text-center text-xs font-bold text-white dark:border-gray-700 ${
                  item.stockMovementType === "MANUAL_ENTRY" ? "bg-green-500" : "bg-red-500"
                }   w-20`}>
                {item.stockMovementType === "MANUAL_ENTRY" ? "ENTRY" : "EXIT"}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
