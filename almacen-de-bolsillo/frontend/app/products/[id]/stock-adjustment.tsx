import { useProducts } from "@/contexts/products";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import type { NewStockMovement } from "@/types/StockMovement";
import { postStockMovement } from "@/services/movementsApi";

const stockAdjustmentSignClassName = "w-6 text-center text-xl leading-6 dark:text-white";
const stockAdjustmentInputClassName = "h-12 min-w-24 px-3 py-0 text-center text-xl leading-6 dark:text-white";

export default function StockAdjustmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, updateProduct } = useProducts();
  const [movementType, setMovementType] = useState<"MANUAL_ENTRY" | "MANUAL_EXIT" | "ADJUSTMENT">("MANUAL_ENTRY");

  const product = products.find((currentProduct) => currentProduct.id === Number(id));
  const [inputAdjustmentValue, setInputAdjustmentValue] = useState("");
  const [inputReason, setInputReason] = useState("");

  if (!product) {
    return (
      <View className="flex-1 p-4">
        <Text className="text-[20px] dark:text-white">Producto no encontrado.</Text>
      </View>
    );
  }

  const currentStock = product.stock;

  function handleStockAdjustment(): boolean {
    if (!product) return false;

    if (inputAdjustmentValue.trim() === "") {
      return false;
    }

    const quantity = Number(inputAdjustmentValue);

    if (!Number.isInteger(quantity) || quantity < 0) {
      return false;
    }

    let newStock: number = product.stock;
    let stockDifference: number = 0;

    switch (movementType) {
      case "MANUAL_ENTRY":
        stockDifference = quantity;
        newStock = currentStock + quantity;
        break;

      case "MANUAL_EXIT":
        stockDifference = -quantity;
        newStock = currentStock - quantity;
        break;

      case "ADJUSTMENT":
        stockDifference = quantity - currentStock;
        newStock = quantity;
        break;
    }

    updateProduct({ ...product, stock: newStock });
    // TODO: Update table of stock movements
    const newStockMovement: NewStockMovement = {
      type: movementType,
      productId: product.id,
      quantity: stockDifference,
      previousStock: currentStock,
      newStock: newStock,
      reason: inputReason.trim() !== "" ? inputReason.trim() : undefined,
    };
    try {
      postStockMovement(newStockMovement);
    } catch (error) {
      console.log("Error", error);
    }

    return true;
  }
  return (
    <>
      <Stack.Screen
        options={{
          title: `Ajustar stock: ${product?.shortname}`,
        }}
      />
      <View className="flex-1 p-4">
        <Text className="text-[17px] dark:text-white mb-2  self-start p-4 mx-auto">
          Stock actual: <Text className="text">{currentStock}</Text>
        </Text>
        <Text className="text-[17px] dark:text-white mb-2 p-4 text-center">Ingrese el valor de ajuste:</Text>
        <View className="flex-row py-4 gap-0.5 ">
          <Pressable
            onPress={() => setMovementType("MANUAL_ENTRY")}
            className={`flex-1 rounded-s-xl  p-4 ${movementType === "MANUAL_ENTRY" ? " bg-gray-500" : " bg-white"}`}>
            <Text
              className={`text-center font-semibold ${movementType === "MANUAL_ENTRY" ? "text-white" : "text-black"}`}>
              ENTRADA
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMovementType("MANUAL_EXIT")}
            className={`flex-1   p-4 ${movementType === "MANUAL_EXIT" ? " bg-gray-500" : " bg-white"}`}>
            <Text
              className={`text-center font-semibold ${movementType === "MANUAL_EXIT" ? "text-white" : "text-black"}`}>
              SALIDA
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMovementType("ADJUSTMENT")}
            className={`flex-1 rounded-e-xl p-4 ${movementType === "ADJUSTMENT" ? " bg-gray-500" : " bg-white"}`}>
            <Text
              className={`text-center font-semibold ${movementType === "ADJUSTMENT" ? "text-white" : "text-black"}`}>
              AJUSTE
            </Text>
          </Pressable>
        </View>

        <View className="my-6 min-w-32 flex-row items-center gap-2 rounded-lg border border-gray-300 p-6 dark:bg-gray-900 mx-auto">
          <View className="h-12 justify-center">
            <Text className={stockAdjustmentSignClassName}>
              {movementType === "MANUAL_ENTRY" ? "+" : movementType === "MANUAL_EXIT" ? "-" : "="}
            </Text>
          </View>
          <TextInput
            keyboardType="numeric"
            value={inputAdjustmentValue}
            onChangeText={(text) => setInputAdjustmentValue(text)}
            placeholder="Valor"
            textAlignVertical="center"
            className={stockAdjustmentInputClassName}
          />
        </View>

        <TextInput
          value={inputReason}
          onChangeText={(text) => setInputReason(text)}
          placeholder="Motivo"
          textAlignVertical="center"
          className="h-12 w-full rounded-lg border border-gray-300 px-3 py-0 text-left text-xl leading-6 dark:text-white mx-auto"
        />
        {/* <Text className="text-sm dark:text-slate-500 ps-1 pt-1">Máximo 17 caracteres</Text> */}

        <View className="w-full flex-row gap-3 py-4">
          <Pressable
            onPress={() => router.back()}
            className="
                 w-[48%]
              items-center 
              justify-center
              rounded-xl 
              border 
              border-gray-300 
              px-4 py-4 
              active:opacity-60 
              ">
            <Text className="text-base font-semibold text-gray-800 dark:text-white">Cancelar</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (handleStockAdjustment()) {
                router.back();
              } else {
                Alert.alert(
                  "Error",
                  "Por favor, ingrese un valor válido para el ajuste de stock. Debe ser un número entero no negativo.",
                  [{ text: "Aceptar" }],
                );
              }
            }}
            className="
             w-[48%]
              items-center 
              justify-center
              rounded-xl 
              bg-[#111A1A] 
              px-4 py-4 
              active:opacity-75 
              dark:bg-white 
              ">
            <Text className="text-base font-semibold text-white dark:text-black">Guardar</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
