import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useProducts } from "@/contexts/products";
import EditProductButton from "@/components/products/EditProductButton";
import DeleteProductButton from "@/components/products/DeleteProductButton";
import { getSuppliers } from "@/services/suppliersApi";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useProducts();
  const [supplierNames, setSupplierNames] = useState<Record<number, string>>({});

  const product = products.find((currentProduct) => currentProduct.id === Number(id));

  useEffect(() => {
    let isMounted = true;

    async function loadSuppliers() {
      try {
        const suppliers = await getSuppliers(true);

        if (!isMounted) return;

        setSupplierNames(Object.fromEntries(suppliers.map((supplier) => [supplier.id, supplier.name])));
      } catch {
        if (!isMounted) return;
        setSupplierNames({});
      }
    }

    loadSuppliers();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!product) {
    return (
      // container
      <View className="flex-1 p-4">
        {/* error */}
        <Text className="text-[20px]">Producto no encontrado.</Text>
      </View>
    );
  }

  const hasLowStock = product.stock <= product.stockMin;

  return (
    <>
      <Stack.Screen
        options={{
          title: product.shortname,
        }}
      />

      <View className="flex p-4 flex-row items-center justify-between  px-2 py-1 ">
        <Text className="text-[28px] font-bold mb-5 dark:text-white">{product.shortname}</Text>
      </View>

      <View className="ml-auto mr-1 flex-row gap-2 pb-4">
        <DeleteProductButton id={id} />
        <EditProductButton id={id} />
      </View>

      <View className="p-5 border border-[#d4d4d4] rounded-xl gap-1.5 dark:bg-gray-900">
        <Text className="mt-3 text-[14px] font-semibold dark:text-white">Nombre largo</Text>
        <Text className="text-[17px] dark:text-white">{product.longname}</Text>

        <Text className="mt-3 text-[14px] font-semibold dark:text-white">SKU</Text>
        <Text className="text-[17px] dark:text-white">{product.sku}</Text>

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
              className="inline-block items-center w-24 rounded-lg border border-gray-300 px-2 py-2 bg-[#111A1A] active:opacity-75 ">
              <Text className="font-semibold text-base text-white">Ajustar</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(`/products/${product.id}/movements`)}
              className="inline-block w-24 items-center rounded-lg border border-gray-300 px-2 py-2 bg-[#111A1A] active:opacity-75 ">
              <Text className="font-semibold text-base text-white">Historial</Text>
            </Pressable>
          </View>
        </View>

        {hasLowStock && (
          <View className="mt-5 flex-row items-center justify-between gap-3 rounded-lg border border-red-500 bg-red-100 p-4 dark:bg-red-900">
            <Text className="text-base font-bold text-red-500">Alerta de stock bajo!</Text>
            <Pressable className="inline-block items-center w-24 rounded-lg border border-gray-300 px-2 py-2 bg-[#111A1A] active:opacity-75 ">
              <Text className="font-semibold text-base text-white">Comprar</Text>
            </Pressable>
          </View>
        )}
        <Text className="mt-3 text-[14px] font-semibold dark:text-white">Stock mínimo</Text>
        <Text className="text-[17px] dark:text-white">{product.stockMin}</Text>
        <Text className="mt-3 text-[14px] font-semibold dark:text-white">Categoría</Text>
        <Text className="text-[17px] dark:text-white">{product.category.name}</Text>
        <Text className="mt-3 text-[14px] font-semibold dark:text-white">Proveedores</Text>
        <Text className="text-[17px] dark:text-white">
          {product.suppliers?.length
            ? product.suppliers.map((supplierId) => supplierNames[supplierId] ?? `#${supplierId}`).join(", ")
            : "No hay proveedores"}
        </Text>
        <Text className="mt-3 text-[14px] font-semibold dark:text-white">Estado</Text>
        <Text className="text-[17px] dark:text-white">{product.isActive ? "Activo" : "Inactivo"}</Text>
      </View>
    </>
  );
}
