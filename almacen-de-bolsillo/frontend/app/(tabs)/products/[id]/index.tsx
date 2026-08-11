import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useProducts } from "@/contexts/products";
import { EditProductButton, DeleteProductButton } from "@/components/products";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useProducts();

  const product = products.find((currentProduct) => currentProduct.id === Number(id));

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Producto no encontrado.</Text>
          <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Es posible que haya sido eliminado o que el identificador sea incorrecto.
          </Text>
        </View>
      </View>
    );
  }

  const hasLowStock = product.stock <= product.stockMin;

  const supplierNames = product.suppliers?.length
    ? product.suppliers.map((supplier) => supplier.name).join(", ")
    : "No hay proveedores";

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#071111]">
      <Stack.Screen
        options={{
          title: product.shortname,
        }}
      />

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-8 pt-4">
        <View className="rounded-[28px] bg-[#111A1A] p-5 dark:bg-slate-950">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-300">Producto</Text>
              <Text className="mt-1 text-4xl font-black text-white">{product.shortname}</Text>
              <Text className="mt-2 text-sm leading-5 text-slate-300" numberOfLines={2}>
                #{product.id} · {product.longname}
              </Text>
            </View>
            <View className={`rounded-full px-3 py-1.5 ${product.isActive ? "bg-emerald-400" : "bg-slate-500"}`}>
              <Text className="text-xs font-black text-[#111A1A]">{product.isActive ? "Activo" : "Inactivo"}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-3">
          <DeleteProductButton id={id} />
          <EditProductButton id={id} />
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
            Precio
          </Text>
          <Text className="mt-1 text-4xl font-black text-emerald-700 dark:text-emerald-300">
            ${product.price.toLocaleString("es-AR")}
          </Text>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <View className="flex-row items-center justify-between gap-4">
            <View>
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                Stock actual
              </Text>
              <Text className="mt-1 text-3xl font-black text-slate-950 dark:text-white">{product.stock}</Text>
              <Text className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Mínimo: {product.stockMin}
              </Text>
            </View>
            <View className="gap-2">
              <Pressable
                onPress={() => router.push(`/products/${product.id}/stock-adjustment`)}
                className="items-center rounded-2xl bg-[#111A1A] px-4 py-3 active:opacity-75 dark:bg-white">
                <Text className="text-sm font-black text-white dark:text-[#111A1A]">Ajustar</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push(`/products/${product.id}/movements`)}
                className="items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 active:opacity-75 dark:border-slate-800 dark:bg-slate-900">
                <Text className="text-sm font-black text-slate-950 dark:text-white">Historial</Text>
              </Pressable>
            </View>
          </View>

          {hasLowStock && (
            <View className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30">
              <Text className="text-base font-black text-red-600 dark:text-red-300">Alerta de stock bajo</Text>
              <Text className="mt-1 text-sm text-red-500 dark:text-red-200">
                El stock actual está igual o por debajo del mínimo configurado.
              </Text>
            </View>
          )}
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <Text className="mb-4 text-lg font-black text-slate-950 dark:text-white">Detalles</Text>
          <View className="gap-4">
            <View>
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                Nombre largo
              </Text>
              <Text className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">
                {product.longname}
              </Text>
            </View>
            <View>
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                SKU
              </Text>
              <Text className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">{product.sku}</Text>
            </View>
            <View>
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                Categoría
              </Text>
              <Text className="mt-1 text-base font-semibold text-indigo-700 dark:text-indigo-300">
                {product.category.name}
              </Text>
            </View>
            <View>
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                Proveedores
              </Text>
              <Text className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">{supplierNames}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
