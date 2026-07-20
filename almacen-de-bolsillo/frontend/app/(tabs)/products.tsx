import { FlatList, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import NewProductButton from "@/components/NewProductButton";
import { useProducts } from "@/contexts/useProducts";
import ListAllProductsButton from "@/components/ListAllProductsButton";

export default function ProductsScreen() {
  const { activeProducts } = useProducts();

  return (
    // container
    <>
      <View className="mb-4 flex-row items-center justify-end  px-2 py-1">
        <Text className="text-3xl font-bold dark:text-white">Productos</Text>
        <View className="ml-auto flex-row gap-2">
          <ListAllProductsButton />
          <NewProductButton />
        </View>
      </View>

      <FlatList
        data={activeProducts}
        keyExtractor={(product) => product.id.toString()}
        renderItem={({ item }) => {
          const hasLowStock = item.stock <= item.stockMin;

          return (
            <>
              <Pressable
                onPress={() => router.push(`/products/${item.id}`)}
                className="rounded-xl  active:scale-[0.98] active:opacity-70  ">
                <View className="flex flex-row justify-between items-center p-4 mb-3 bg-white dark:bg-gray-900 border border-[#d4d4d4] dark:border-gray-600 rounded-xl ">
                  <View className="gap-1">
                    <Text className="text-[22px] font-semibold dark:text-white pb-2">{item.shortname}</Text>
                    <Text className="font-semibold dark:text-white">{item.longname}</Text>
                    <Text className="text-base dark:text-white">Precio: ${item.price.toLocaleString("es-AR")}</Text>
                    <Text className="dark:text-white">Stock: {item.stock}</Text>
                    <Text className="dark:text-white">Stock mínimo: {item.stockMin}</Text>
                    <Text className="dark:text-white">Categoría: {item.categoryId}</Text>
                    <Text className="dark:text-white">Estado: {item.isActive ? "Activo" : "Inactivo"}</Text>
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
