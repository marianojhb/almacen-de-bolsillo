import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, Text, View } from "react-native";
import { useProducts } from "@/contexts/useProducts";
import { useState, useEffect } from "react";
import type { Product } from "@/types/Product";
import ProductForm from "@/components/ProductForm";

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, updateProduct } = useProducts();

  const product = products.find((currentProduct) => currentProduct.id === Number(id));
  const [productState, setProductState] = useState<Product | null>(null);

  useEffect(() => {
    if (product) {
      setProductState(product);
    }
  }, [product]);

  if (!product) {
    return (
      <View className="flex-1 p-4">
        <Text className="text-[20px] dark:text-white">Producto no encontrado.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Edit: ${product?.name}`,
        }}
      />
      <ProductForm
        initialValues={{
          sku: product?.sku ?? "",
          name: product?.name ?? "",
          category: product?.category ?? "",
          price: product?.price.toString() ?? "",
          stock: product?.stock.toString() ?? "",
          minimumStock: product?.minimumStock.toString() ?? "",
        }}
        submitLabel="Guardar"
        onCancel={() => router.back()}
        onSubmit={(values) => {
          const updatedProduct: Product = {
            ...productState!,
            sku: values.sku.trim(),
            name: values.name.trim(),
            category: values.category.trim(),
            price: values.price,
            stock: values.stock,
            minimumStock: values.minimumStock,
          };

          updateProduct(updatedProduct);

          Alert.alert("Producto actualizado", `${updatedProduct.name} fue actualizado correctamente.`, [
            {
              text: "Aceptar",
              onPress: () => router.back(),
            },
          ]);
        }}
      />
      {/* <KeyboardAvoidingView
        className="flex-1 bg-white dark:bg-black"
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          className="flex-1 dark:bg-black"
          contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 160 }}
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps="handled">
          <View className="mb-4 flex-row items-center justify-between">
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
          </View>
          <View className="border border-[#d4d4d4] rounded-xl gap-1.5 p-5">
            <Text className="mt-3 text-[14px] font-semibold dark:text-white">SKU</Text>
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
      </KeyboardAvoidingView> */}
    </>
  );
}
