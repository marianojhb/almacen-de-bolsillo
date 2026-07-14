import { products } from "@/data/products";
import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ProductDetailScreen() {

  const { id } = useLocalSearchParams<{ id: string }>();

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

  return (    <>
      <Stack.Screen
        options={{
          title: product.name,
        }}
      />

      {/* container */}
      <View className="flex-1 p-4">
        {/* title */}
        <Text className="text-[28px] font-bold mb-5">{product.name}</Text>

        {/* card */}
        <View className="p-5 border border-[#d4d4d4] rounded-xl gap-1.5">
          {/* label */}
          <Text className="mt-3 text-[14px] font-semibold">SKU</Text>
          {/* value */}
          <Text className="text-[17px]">{product.sku}</Text>

          <Text className="mt-3 text-[14px] font-semibold">Categoría</Text>
          <Text className="text-[17px]">{product.category}</Text>

          <Text className="mt-3 text-[14px] font-semibold">Precio</Text>
          <Text className="text-[17px]">${product.price.toLocaleString("es-AR")}</Text>

          <Text className="mt-3 text-[14px] font-semibold">Stock actual</Text>
          <Text className="text-[17px]">{product.stock}</Text>

          <Text className="mt-3 text-[14px] font-semibold">Stock mínimo</Text>
          <Text className="text-[17px]">{product.minimumStock}</Text>

          {/* warning */}
          {hasLowStock && <Text className="mt-5 text-base font-bold text-red-500">Stock bajo</Text>}
        </View>
      </View>
    </>
  );
}
