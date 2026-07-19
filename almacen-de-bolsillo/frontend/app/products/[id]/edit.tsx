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
    </>
  );
}
