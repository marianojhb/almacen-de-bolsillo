import { useProducts } from "@/contexts/products";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import type { CreateStockMovementDto } from "@almacen/shared";
import { postStockMovement } from "@/services/movementsApi";

const stockAdjustmentSignClassName = "w-8 text-center text-3xl font-black leading-8 text-slate-950 dark:text-white";
const stockAdjustmentInputClassName =
  "h-16 min-w-28 px-3 py-0 text-center text-3xl font-black leading-8 text-slate-950 dark:text-white";

export default function StockAdjustmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, refreshProducts } = useProducts();
  const [movementType, setMovementType] = useState<"MANUAL_ENTRY" | "MANUAL_EXIT" | "ADJUSTMENT">("MANUAL_ENTRY");

  const product = products.find((currentProduct) => currentProduct.id === Number(id));
  const [inputAdjustmentValue, setInputAdjustmentValue] = useState("");
  const [inputReason, setInputReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Producto no encontrado.</Text>
          <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            No encontramos el producto para ajustar su stock.
          </Text>
        </View>
      </View>
    );
  }

  const currentStock = product.stock;

  async function handleStockAdjustment(): Promise<boolean> {
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

    const newStockMovement: CreateStockMovementDto = {
      type: movementType,
      productId: product.id,
      quantity: stockDifference,
      previousStock: currentStock,
      newStock,
      reason: inputReason.trim() !== "" ? inputReason.trim() : undefined,
    };

    try {
      setIsSaving(true);
      await postStockMovement(newStockMovement);
      await refreshProducts();
      return true;
    } catch (error) {
      console.log("Error", error);
      Alert.alert("Error", "No se pudo registrar el movimiento de stock.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Ajustar stock: ${product?.shortname}`,
        }}
      />
      <View className="flex-1 bg-slate-50 px-4 pt-4 dark:bg-[#071111]">
        <View className="mb-4 rounded-[28px] bg-[#111A1A] p-5 dark:bg-slate-950">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-300">Stock</Text>
          <Text className="mt-1 text-3xl font-black text-white">Ajustar inventario</Text>
          <Text className="mt-2 text-sm leading-5 text-slate-300">
            {product.shortname} · stock actual {currentStock}
          </Text>
        </View>

        <View className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <Text className="mb-4 text-lg font-black text-slate-950 dark:text-white">Tipo de movimiento</Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setMovementType("MANUAL_ENTRY")}
              className={`flex-1 rounded-2xl border p-4 active:opacity-75 ${
                movementType === "MANUAL_ENTRY"
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              }`}>
              <Text
                className={`text-center font-black ${
                  movementType === "MANUAL_ENTRY" ? "text-white" : "text-slate-700 dark:text-slate-200"
                }`}>
                ENTRADA
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMovementType("MANUAL_EXIT")}
              className={`flex-1 rounded-2xl border p-4 active:opacity-75 ${
                movementType === "MANUAL_EXIT"
                  ? "border-red-500 bg-red-500"
                  : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              }`}>
              <Text
                className={`text-center font-black ${
                  movementType === "MANUAL_EXIT" ? "text-white" : "text-slate-700 dark:text-slate-200"
                }`}>
                SALIDA
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMovementType("ADJUSTMENT")}
              className={`flex-1 rounded-2xl border p-4 active:opacity-75 ${
                movementType === "ADJUSTMENT"
                  ? "border-blue-600 bg-blue-600"
                  : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              }`}>
              <Text
                className={`text-center font-black ${
                  movementType === "ADJUSTMENT" ? "text-white" : "text-slate-700 dark:text-slate-200"
                }`}>
                AJUSTE
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-4 items-center rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <Text className="mb-4 text-center text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
            Valor de ajuste
          </Text>
          <View className="min-w-40 flex-row items-center justify-center gap-3 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
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
        </View>

        <View className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <Text className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
            Motivo
          </Text>
          <TextInput
            value={inputReason}
            onChangeText={(text) => setInputReason(text)}
            placeholder="Motivo opcional"
            placeholderTextColor="#94a3b8"
            textAlignVertical="center"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-0 text-left text-base font-medium leading-5 text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </View>

        <View className="mt-auto w-full flex-row gap-3 pb-4">
          <Pressable
            onPress={() => router.back()}
            className="flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-4 active:opacity-60 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-base font-black text-slate-700 dark:text-white">Cancelar</Text>
          </Pressable>
          <Pressable
            disabled={isSaving}
            onPress={async () => {
              const stockWasAdjusted = await handleStockAdjustment();

              if (stockWasAdjusted) {
                router.back();
                return;
              }

              if (!isSaving) {
                Alert.alert(
                  "Error",
                  "Por favor, ingrese un valor válido para el ajuste de stock. Debe ser un número entero no negativo.",
                  [{ text: "Aceptar" }],
                );
              }
            }}
            className="flex-1 items-center justify-center rounded-2xl bg-[#111A1A] px-4 py-4 active:opacity-75 disabled:opacity-60 dark:bg-white">
            <Text className="text-base font-black text-white dark:text-[#111A1A]">
              {isSaving ? "Guardando..." : "Guardar"}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
