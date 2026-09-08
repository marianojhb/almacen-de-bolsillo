import { useState } from "react";
import { router } from "expo-router";
import {
  FlatList,
  Pressable,
  // ScrollView,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

// import { usePurchaseDraft } from "@/contexts/purchase-draft";
// import { createPurchaseOrderRequest } from "@/services/purchasesApi";
import { Ionicons } from "@expo/vector-icons";

export default function NewPurchaseScreen() {
  const colorScheme = useColorScheme();
  const [isOnlyMissingProducts, setIsOnlyMissingProducts] = useState(false);
  const [search, setSearch] = useState("");

  /*  previously commented out code

  const { items, totalAmount, removeItem, clearPurchase } = usePurchaseDraft();
  const [supplierId, setSupplierId] = useState("1");
  const [isSavingPurchase, setIsSavingPurchase] = useState(false);

  const isDisabled = items.length === 0 || isSavingPurchase || Number(supplierId) <= 0;

  async function handleAddPurchase() {
    setIsSavingPurchase(true);

      // Create the purchase order payload
    const puchaseOrderPayload = {
      total: totalAmount,
      supplierId: Number(supplierId),
      userId: 3, // Replace with the actual user ID
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
        discount: item.discount,
      })),
    };

    // Send the purchase order to the backend
    try {
      // Call the API to create the purchase order
      const purchaseOrder = await createPurchaseOrderRequest(puchaseOrderPayload);
      clearPurchase();
      router.replace("/purchases");
    } catch (error) {
      console.error("Error creating purchase order:", error);
    } finally {
      setIsSavingPurchase(false);
    }

    */

  return (
    <>
      <View className="flex-1 p-4">
        <View className="flex-row items-start">
          <Pressable onPress={() => router.back()} className="mr-3 pt-2">
            <Ionicons name="arrow-back" size={24} color={colorScheme === "dark" ? "#9ca3af" : "black"} />
          </Pressable>

          <View className="flex-1">
            <Text className="text-base font-bold dark:text-white ">1. Elegir productos</Text>
            <Text className="mt-1 text-sm text-gray-600">Seleccioná los productos que querés comprar</Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-base">
            <Ionicons name="cart" size={18} color={colorScheme === "dark" ? "#9ca3af" : "black"} /> Solo faltantes
          </Text>
          <Switch value={isOnlyMissingProducts} onValueChange={setIsOnlyMissingProducts} />
        </View>

        <View className="mt-3 flex-row items-center rounded-lg border border-gray-300 p-4">
          <Ionicons name="search" size={18} color="#9ca3af" />

          <TextInput
            className="ms-2 flex-1 text-sm text-gray-600"
            placeholder="Buscar productos"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View className="mt-auto flex-row">
          <View className="flex-column">
            <Text>3 productos seleccionados</Text>
            <Text>Total sugerido: 15 unidades</Text>
          </View>
          <View className="flex-column ms-auto items-center justify-center">
            <Pressable
              className="w-44 ms-auto mt-4 rounded-lg bg-green-800 p-3 items-center"
              onPress={() => router.push("/(tabs)/purchases/new/select-suppliers")}>
              <Text className="text-white font-bold">
                Continuar <Ionicons name="arrow-forward" size={18} color="white" />
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* <ScrollView className="flex-1 p-2" alwaysBounceVertical={false} bounces contentContainerClassName="flex-grow">
        <Pressable
          className="border rounded p-2 border-gray-300 w-full mb-2"
          onPress={() => router.push("/purchases/new/select-products")}>
          <View className="flex-column items-start">
            <Text className="text-base font-bold pb-2">Items:</Text>

            {items.length === 0 && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">No hay productos agregados</Text>
            )}

            {items.map((item) => (
              <View key={item.productId}>
                <Text>{item.shortname}</Text>
                <View className="flex-row items-center justify-between w-full">
                  <Text>
                    Cantidad: {item.quantity} ${item.price} c/u
                  </Text>
                  <Text className="ms-auto">
                    {(item.quantity * item.price).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                  </Text>
                  <Pressable
                    className="border border-red-500 p-2 px-4 rounded ms-2"
                    onPress={() => removeItem(item.productId)}>
                    <Text className="text-red-500 font-bold">x</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <Text className="text-base font-bold pt-2 ms-auto">
              Total: {totalAmount.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
            </Text>
          </View>
        </Pressable>

        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-bold mr-2">Proveedor</Text>
          <TextInput
            placeholder="ID proveedor"
            className="text-right rounded-md p-2 w-1/2 border border-gray-300"
            value={supplierId}
            onChangeText={setSupplierId}
            keyboardType="numeric"
          />
        </View>

        <View className="mt-auto">
          <Pressable
            className={`rounded-lg p-4 items-center mt-8 ${!isDisabled ? " bg-green-500" : " bg-gray-300"}`}
            onPress={handleAddPurchase}
            disabled={isDisabled}>
            <Text className="text-white">{isSavingPurchase ? "Guardando compra..." : "Guardar compra"}</Text>
          </Pressable>

          <Pressable
            className="bg-gray-500 rounded-lg p-4 items-center w-full mt-4"
            onPress={() => {
              clearPurchase();
              router.back();
            }}>
            <Text className="text-white">Cancelar</Text>
          </Pressable>
        </View>
      </ScrollView> */}
    </>
  );
}
