import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useProducts } from "@/contexts/useProducts";
import EditProductButton from "@/components/EditProductButton";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useProducts();

  const product = products.find((currentProduct) => currentProduct.id === Number(id));

  if (!product) {
    return (
      // container
      <View className="flex-1 p-4">
        {/* error */}
        <Text className="text-[20px]">Producto no encontrado.</Text>
      </View>
    );
  }

  const hasLowStock = product.stock <= product.minimumStock;

  return (
    <>
      <Stack.Screen
        options={{
          title: product.name,
        }}
      />

      <View className="flex p-4 mb-4 flex-row items-center justify-between  px-2 py-1 ">
        <Text className="text-[28px] font-bold mb-5 dark:text-white">{product.name}</Text>
        <EditProductButton id={id} />
      </View>

      <View className="p-5 border border-[#d4d4d4] rounded-xl gap-1.5 dark:bg-gray-900">
        <Text className="mt-3 text-[14px] font-semibold dark:text-white">SKU</Text>
        <Text className="text-[17px] dark:text-white">{product.sku}</Text>

        <Text className="mt-3 text-[14px] font-semibold dark:text-white">Categoría</Text>
        <Text className="text-[17px] dark:text-white">{product.category}</Text>

        <Text className="mt-3 text-[14px] font-semibold dark:text-white">Precio</Text>
        <Text className="text-[17px] dark:text-white">${product.price.toLocaleString("es-AR")}</Text>

        <View className="flex-row items-center justify-between dark:text-white">
          <View>
            <Text className="mt-3 text-[14px] font-semibold dark:text-white">Stock actual</Text>
            <Text className="text-[17px] dark:text-white">{product.stock}</Text>
          </View>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push(`/products/${product.id}/stock-adjustment`)}
              className="inline-block items-center rounded-lg border border-gray-300 px-3 py-2 bg-[#111A1A] active:opacity-75 ">
              <Text className="font-semibold text-base text-white">Ajustar</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(`/products/${product.id}/movements`)}
              className="inline-block items-center rounded-lg border border-gray-300 px-3 py-2 bg-[#111A1A] active:opacity-75 ">
              <Text className="font-semibold text-base text-white">Historial</Text>
            </Pressable>
          </View>
        </View>

        <Text className="mt-3 text-[14px] font-semibold dark:text-white">Stock mínimo</Text>
        <Text className="text-[17px] dark:text-white">{product.minimumStock}</Text>

        {hasLowStock && <Text className="mt-5 text-base font-bold text-red-500">Stock bajo</Text>}
      </View>
    </>
  );
}
