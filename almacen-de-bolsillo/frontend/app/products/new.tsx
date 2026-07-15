import { router, Stack } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import colors from "tailwindcss/colors";
import { useProducts } from "@/contexts/useProducts";
import type { NewProduct } from "@/types/Product";

export default function NewProductScreen() {
  const { addProduct } = useProducts();
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [minimumStock, setMinimumStock] = useState("");

  function handleSaveProduct() {
    if (!sku.trim() || !name.trim() || !category.trim() || !price.trim() || !stock.trim() || !minimumStock.trim()) {
      Alert.alert("Campos incompletos", "Todos los campos son obligatorios.");
      return;
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);
    const numericMinimumStock = Number(minimumStock);

    if (Number.isNaN(numericPrice) || Number.isNaN(numericStock) || Number.isNaN(numericMinimumStock)) {
      Alert.alert("Datos inválidos", "Precio y stock deben contener valores numéricos.");
      return;
    }

    if (numericPrice < 0 || numericStock < 0 || numericMinimumStock < 0) {
      Alert.alert("Datos inválidos", "El precio y las cantidades de stock no pueden ser negativas.");
      return;
    }

    const newProduct: NewProduct = {
      sku: sku.trim(),
      name: name.trim(),
      category: category.trim(),
      price: numericPrice,
      stock: numericStock,
      minimumStock: numericMinimumStock,
    };

    addProduct(newProduct);

    Alert.alert("Producto registrado", `${newProduct.name} fue registrado correctamente.`, [
      {
        text: "Aceptar",
        onPress: () => router.back(),
      },
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nuevo producto",
        }}
      />

      <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          className="flex-1 dark:bg-black"
          contentContainerClassName="gap-5 p-5"
          keyboardShouldPersistTaps="handled">
          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-700 dark:text-white ">SKU</Text>

            <TextInput
              value={sku}
              onChangeText={setSku}
              placeholder="Ejemplo: BEB-001"
              placeholderTextColor={colors.gray[400]}
              autoCapitalize="characters"
              className="rounded-xl border border-gray-300 px-4 py-3 text-base dark:text-white"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-700 dark:text-white">Nombre</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nombre del producto"
              placeholderTextColor={colors.gray[400]}
              className="rounded-xl border border-gray-300 px-4 py-3 text-base dark:text-white"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-700 dark:text-white">Categoría</Text>

            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="Ejemplo: Bebidas"
              placeholderTextColor={colors.gray[400]}
              className="rounded-xl border border-gray-300 px-4 py-3 text-base dark:text-white"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-700 dark:text-white">Precio</Text>

            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              keyboardType="decimal-pad"
              placeholderTextColor={colors.gray[400]}
              className="rounded-xl border border-gray-300 px-4 py-3 text-base dark:text-white"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-700 dark:text-white">Stock actual</Text>

            <TextInput
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              keyboardType="number-pad"
              placeholderTextColor={colors.gray[400]}
              className="rounded-xl border border-gray-300 px-4 py-3 text-base dark:text-white"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-700 dark:text-white">Stock mínimo</Text>

            <TextInput
              value={minimumStock}
              onChangeText={setMinimumStock}
              placeholder="0"
              keyboardType="number-pad"
              placeholderTextColor={colors.gray[400]}
              className="rounded-xl border border-gray-300 px-4 py-3 text-base dark:text-white"
            />
          </View>

          <Pressable
            onPress={handleSaveProduct}
            className="mt-2 items-center rounded-xl bg-[#111A1A] px-4 py-4 active:opacity-75 dark:bg-white">
            <Text className="text-base font-semibold text-white dark:text-black">Guardar producto</Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            className="items-center rounded-xl border border-gray-300 px-4 py-4 active:opacity-60 ">
            <Text className="text-base font-semibold text-gray-800 dark:text-white">Cancelar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
