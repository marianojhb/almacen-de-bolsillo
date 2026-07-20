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
          title: `Edit: ${product?.shortname}`,
        }}
      />
      <ProductForm
        initialValues={{
          sku: product?.sku ?? "",
          shortname: product?.shortname ?? "",
          longname: product?.longname ?? "",
          price: product?.price.toString() ?? "",
          stock: product?.stock.toString() ?? "",
          stockMin: product?.stockMin.toString() ?? "",
          categoryId: product?.categoryId.toString() ?? "",
          isActive: product?.isActive ?? true,
        }}
        submitLabel="Guardar"
        onCancel={() => router.back()}
        onSubmit={(values) => {
          const updatedProduct: Product = {
            ...productState!,
            sku: values.sku.trim(),
            shortname: values.shortname.trim(),
            longname: values.longname.trim(),
            price: values.price,
            stock: values.stock,
            stockMin: values.stockMin,
            categoryId: values.categoryId,
            isActive: values.isActive,
          };

          updateProduct(updatedProduct);

          Alert.alert("Producto actualizado", `${updatedProduct.shortname} fue actualizado correctamente.`, [
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
