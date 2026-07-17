import { FlatList, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import NewProductButton from "@/components/NewProductButton";
import { useProducts } from "@/contexts/useProducts";

export default function ProductsScreen() {
  const { products } = useProducts();

  return (
    // container
    <>
      <View className="mb-4 flex-row items-center justify-between  px-2 py-1">
        <Text className="text-3xl font-bold dark:text-white">Productos</Text>
        <NewProductButton />
      </View>

      <FlatList
        data={products}
        keyExtractor={(product) => product.id.toString()}
        renderItem={({ item }) => {
          const hasLowStock = item.stock <= item.minimumStock;

          return (
            <>
              <Pressable
                onPress={() => router.push(`/products/${item.id}`)}
                className="rounded-xl  active:scale-[0.98] active:opacity-70  ">
                {/* productCard */}
                <View className="flex flex-row justify-between items-center p-4 mb-3 bg-white dark:bg-gray-900 border border-[#d4d4d4] dark:border-gray-600 rounded-xl ">
                  {/* product information */}
                  <View className="gap-1">
                    {/* productName */}
                    <Text className="text-[17px] font-semibold dark:text-white">{item.name}</Text>
                    {/* productPrice */}
                    <Text className="text-base dark:text-white">${item.price.toLocaleString("es-AR")}</Text>
                    {/* el stock */}
                    <Text className="dark:text-white">Stock: {item.stock}</Text>
                  </View>
                  {/* alerta de bajo stock */}
                  {hasLowStock && <Text className="font-bold text-red-500">Stock bajo</Text>}
                </View>
              </Pressable>
            </>
          );
        }}
      />
    </>
  );
}
