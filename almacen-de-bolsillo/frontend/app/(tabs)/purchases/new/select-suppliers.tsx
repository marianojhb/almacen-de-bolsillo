import { router } from "expo-router";
import { View, Text, Pressable, useColorScheme, FlatList, Image, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePurchaseDraft } from "@/contexts/purchase-draft";
import { useSuppliers } from "@/contexts/suppliers";
import { useProducts } from "@/contexts/products";
import { useState } from "react";

export default function SelectSuppliersScreen() {
  const colorScheme = useColorScheme();

  const { items } = usePurchaseDraft();
  const { products, isLoadingProducts, productsError } = useProducts();
  const { suppliers, isLoadingSuppliers, suppliersError } = useSuppliers();

  const [purchaseQuantities, setPurchaseQuantities] = useState<Record<string, number>>({});
  const getPurchaseKey = (productId: number, supplierId: number) => `${productId}-${supplierId}`;

  return (
    <View className="flex-1 p-4">
      <View className="flex-row items-start mb-2">
        <Pressable onPress={() => router.back()} className="mr-3 pt-2">
          <Ionicons name="arrow-back" size={24} color={colorScheme === "dark" ? "#9ca3af" : "black"} />
        </Pressable>

        <View className="flex-column">
          <Text className="text-base font-bold dark:text-white ">2. Elegir proveedor y cantidades</Text>
          <Text className="mt-1 text-sm text-gray-600">Elegí proveedor para cada producto</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={({ item }) => {
          const availableSuppliers = suppliers.some((supplier) =>
            supplier.products.filter((p) => p.productId === item.productId),
          );
          const product = products.find((p) => p.id === item.productId);
          const stockNeeded =
            product?.stockMin != null && product?.stock != null && product.stock < product.stockMin
              ? product.stockMin - product.stock
              : 0;
          return (
            <View className="flex-column border border-1 rounded-lg border-gray-300 dark:border-gray-700 mb-2">
              <View className="flex-row *:items-start   py-2 px-2 ">
                <View className="border border-gray-300 dark:border-gray-700 p-2 w-24 h-24"></View>
                <View className="flex-column items-start  ps-2">
                  <Text className="text-base dark:text-white">{item.shortname}</Text>

                  {stockNeeded > 0 ? (
                    <Text className="text-sm text-red-500 dark:text-gray-400">Necesitás {stockNeeded} unidades</Text>
                  ) : (
                    <Text className="text-sm text-green-500 dark:text-gray-400">Stock actual es suficiente</Text>
                  )}
                </View>
              </View>

              <View></View>

              <View className="flex-row items-center justify-between  py-2">
                {!availableSuppliers && (
                  <View>
                    <Text className="mt-1 text-sm text-red-500 dark:text-red-400">
                      No hay proveedores disponibles para este producto.
                    </Text>
                  </View>
                )}

                {availableSuppliers && (
                  <View className="flex-column px-2">
                    <View className="flex-row w-full  items-center justify-between  mb-2">
                      <Text className="text-[10px] text-gray-600 dark:text-gray-400 w-24 ">Proveedor</Text>
                      <Text className="text-[10px] text-gray-600 dark:text-gray-400 w-24 text-center">
                        Precio unidad
                      </Text>
                      <Text className="text-[10px] text-gray-600 dark:text-gray-400 w-28 text-center ">Cantidad</Text>
                      <Text className="text-[10px] text-gray-600 dark:text-gray-400 w-24 text-center">Total</Text>
                    </View>

                    <FlatList
                      data={
                        availableSuppliers
                          ? suppliers.filter((supplier) =>
                              supplier.products.some((p) => p.productId === item.productId),
                            )
                          : []
                      }
                      keyExtractor={(supplier) => supplier.id.toString()}
                      renderItem={({ item: supplier }) => {
                        const key = getPurchaseKey(item.productId, supplier.id);
                        const quantity = purchaseQuantities[key] ?? 0;
                        const supplierProduct = supplier.products.find((p) => p.productId === item.productId);
                        const price = Number(supplierProduct?.price ?? 0);
                        const subtotal = price * quantity;

                        return (
                          <View className="flex-row items-center justify-between py-2 ">
                            <Text className="text-[10px] w-24   dark:text-white ">{supplier.name}</Text>
                            <Text className="text-[10px] text-center w-24 dark:text-white ">
                              {price.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                            </Text>
                            <View className=" w-18 flex-row items-center border border-gray-300 rounded  dark:bg-[#071111] dark:text-white ">
                              <Pressable className="text-[10px] text-center px-4 dark:text-white "
                              onPress={()=>{
                                setPurchaseQuantities((prev) => {
                                  const newQuantity = Math.max(0, (prev[key] ?? 0) - 1);
                                  return {
                                    ...prev,
                                    [key]: newQuantity,
                                  };
                                });
                              }}
                              ><Text>-</Text></Pressable>
                              <TextInput
                                className="w-8 h-8  text-center text-[10px] "
                                placeholder="0"
                                value={quantity > 0 ? String(quantity) : ""}
                                keyboardType="numeric"
                                onChangeText={(value) => {
                                  const newQuantity = Number(value) || 0;
                                  setPurchaseQuantities((prev) => ({
                                    ...prev,
                                    [key]: newQuantity,
                                  }));
                                }}
                              />
                              <Pressable className="text-[10px] text-center px-4 dark:text-white" 
                              onPress={() => {
                                setPurchaseQuantities((prev) => {
                                  const newQuantity = (prev[key] ?? 0) + 1;
                                  return {
                                    ...prev,
                                    [key]: newQuantity,
                                  };
                                });
                              }}><Text>+</Text></Pressable>
                            </View>
                            <Text className="text-[10px] w-24 text-center dark:text-white ">
                              $ {subtotal.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                            </Text>
                          </View>
                        );
                      }}
                    />
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />

      <View className="flex-1  bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="flex-column  mt-auto ">
          <Pressable
            className="w-44 ms-auto mt-4 rounded-lg bg-green-800 p-3 items-center"
            onPress={() => router.push("/(tabs)/purchases/new/review")}>
            <Text className="text-white font-bold">
              Continuar <Ionicons name="arrow-forward" size={18} color="white" />
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
