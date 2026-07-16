import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
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

      {/* container */}
      <View className="flex p-4 mb-4 flex-row items-center justify-between  px-2 py-1">
        {/* title */}
        <Text className="text-[28px] font-bold mb-5 dark:text-white">{product.name}</Text>
        {/* edit button */}
        <EditProductButton id={id} />
      </View>
      {/* card */}
      <View className="p-5 border border-[#d4d4d4] rounded-xl gap-1.5">
        {/* label */}
        <Text className="mt-3 text-[14px] font-semibold dark:text-white">SKU</Text>
        {/* value */}
        <Text className="text-[17px] dark:text-white">{product.sku}</Text>

        <Text className="mt-3 text-[14px] font-semibold dark:text-white">Categoría</Text>
        <Text className="text-[17px] dark:text-white">{product.category}</Text>

        <Text className="mt-3 text-[14px] font-semibold dark:text-white">Precio</Text>
        <Text className="text-[17px] dark:text-white">${product.price.toLocaleString("es-AR")}</Text>

        <Text className="mt-3 text-[14px] font-semibold dark:text-white">Stock actual</Text>
        <Text className="text-[17px] dark:text-white">{product.stock}</Text>

        <Text className="mt-3 text-[14px] font-semibold dark:text-white">Stock mínimo</Text>
        <Text className="text-[17px] dark:text-white">{product.minimumStock}</Text>

        {/* warning */}
        {hasLowStock && <Text className="mt-5 text-base font-bold text-red-500">Stock bajo</Text>}
      </View>
    </>
  );
}
