import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useProducts } from "@/contexts/useProducts";
import { useState, useEffect } from "react";
import type { Product } from "@/types/Product";

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, updateProduct } = useProducts();

  const product = products.find((currentProduct) => currentProduct.id === Number(id));
  const [productState, setProductState] = useState<Product | null>(null);
  const [priceInput, setPriceInput] = useState("");

  useEffect(() => {
    if (product) {
      setProductState(product);
      setPriceInput(product.price.toString());
    }
  }, [product]);

  if (!product) {
    return (
      <View className="flex-1 p-4">
        <Text className="text-[20px] dark:text-white">Producto no encontrado.</Text>
      </View>
    );
  }

  const handleSaveProduct = () => {
    if (
      !productState?.sku?.trim() ||
      !productState?.name?.trim() ||
      !productState?.category?.trim() ||
      !priceInput.trim() ||
      !productState?.stock?.toString().trim() ||
      !productState?.minimumStock?.toString().trim()
    ) {
      Alert.alert("Campos incompletos", "Todos los campos son obligatorios.");
      return;
    }

    const numericPrice = Number(priceInput.replace(",", "."));
    const numericStock = Number(productState.stock);
    const numericMinimumStock = Number(productState.minimumStock);

    if (Number.isNaN(numericPrice) || Number.isNaN(numericStock) || Number.isNaN(numericMinimumStock)) {
      Alert.alert("Datos inválidos", "Precio y stock deben contener valores numéricos.");
      return;
    }

    if (numericPrice < 0 || numericStock < 0 || numericMinimumStock < 0) {
      Alert.alert("Datos inválidos", "El precio y las cantidades de stock no pueden ser negativas.");
      return;
    }

    const updatedProduct: Product = {
      ...productState,
      sku: productState.sku.trim(),
      name: productState.name.trim(),
      category: productState.category.trim(),
      price: numericPrice,
      stock: numericStock,
      minimumStock: numericMinimumStock,
    };

    updateProduct(updatedProduct);

    Alert.alert("Producto actualizado", `${updatedProduct.name} fue actualizado correctamente.`, [
      {
        text: "Aceptar",
        onPress: () => router.back(),
      },
    ]);
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: `Edit: ${product?.name}`,
        }}
      />
      <KeyboardAvoidingView
        className="flex-1 bg-white dark:bg-black"
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          className="flex-1 dark:bg-black"
          contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 160 }}
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps="handled">
          {/* container */}
          <View className="mb-4 flex-row items-center justify-between">
            {/* title */}
            <TextInput
              className="text-[28px] font-bold mb-5  dark:text-white bg-slate-300 dark:bg-slate-800 rounded ps-1 pe-3 py-1"
              returnKeyType="done"
              onChangeText={(value) =>
                setProductState((currentProduct) =>
                  currentProduct ? { ...currentProduct, name: value } : currentProduct,
                )
              }
              value={productState?.name ?? ""}
              placeholder="Nombre del producto"
            />
            {/* edit button */}
          </View>
          {/* card */}
          <View className="border border-[#d4d4d4] rounded-xl gap-1.5 p-5">
            {/* label */}
            <Text className="mt-3 text-[14px] font-semibold dark:text-white">SKU</Text>
            {/* value */}
            <TextInput
              className="text-[17px] dark:text-white bg-slate-300 dark:bg-slate-800 rounded ps-1 pe-3 py-1"
              returnKeyType="done"
              onChangeText={(value) =>
                setProductState((currentProduct) =>
                  currentProduct ? { ...currentProduct, sku: value } : currentProduct,
                )
              }
              value={productState?.sku ?? ""}
            />

            <Text className="mt-3 text-[14px] font-semibold dark:text-white">Categoría</Text>
            <TextInput
              className="text-[17px] dark:text-white bg-slate-300 dark:bg-slate-800 rounded ps-1 pe-3 py-1"
              returnKeyType="done"
              onChangeText={(value) =>
                setProductState((currentProduct) =>
                  currentProduct ? { ...currentProduct, category: value } : currentProduct,
                )
              }
              value={productState?.category ?? ""}
            />

            <Text className="mt-3 text-[14px] font-semibold dark:text-white">Precio</Text>
            <TextInput
              className="text-[17px] dark:text-white bg-slate-300 dark:bg-slate-800 rounded ps-1 pe-3 py-1"
              keyboardType="decimal-pad"
              returnKeyType="done"
              blurOnSubmit
              onChangeText={setPriceInput}
              value={priceInput}
            />

            <Text className="mt-3 text-[14px] font-semibold dark:text-white">Stock actual</Text>
            <TextInput
              className="text-[17px] dark:text-white bg-slate-300 dark:bg-slate-800 rounded ps-1 pe-3 py-1"
              keyboardType="number-pad"
              returnKeyType="done"
              blurOnSubmit
              onChangeText={(value) =>
                setProductState((currentProduct) =>
                  currentProduct ? { ...currentProduct, stock: Number(value) || 0 } : currentProduct,
                )
              }
              value={productState?.stock?.toString() ?? ""}
            />

            <Text className="mt-3 text-[14px] font-semibold dark:text-white">Stock mínimo</Text>
            <TextInput
              className="text-[17px] dark:text-white bg-slate-300 dark:bg-slate-800 rounded ps-1 pe-3 py-1"
              keyboardType="number-pad"
              returnKeyType="done"
              blurOnSubmit
              onChangeText={(value) =>
                setProductState((currentProduct) =>
                  currentProduct ? { ...currentProduct, minimumStock: parseInt(value) || 0 } : currentProduct,
                )
              }
              value={productState?.minimumStock?.toString() ?? ""}
            />

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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
