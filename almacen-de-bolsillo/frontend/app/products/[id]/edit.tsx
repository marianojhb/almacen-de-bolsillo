import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, Text, View } from "react-native";
import { useProducts } from "@/contexts/products";
import ProductForm from "@/components/ProductForm";

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    isLoadingProducts,
    products,
    productsError,
    updateProduct,
    categories,
    addCategory,
    isLoadingCategories,
    categoriesError,
  } = useProducts();

  const product = products.find((currentProduct) => currentProduct.id === Number(id));

  if (isLoadingProducts) {
    return (
      <View className="flex-1 p-4">
        <Text className="text-[20px] dark:text-white">Cargando producto...</Text>
      </View>
    );
  }

  if (productsError) {
    return (
      <View className="flex-1 p-4">
        <Text className="text-[20px] dark:text-white">{productsError}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 p-4">
        <Text className="text-[20px] dark:text-white">Producto no encontrado.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Editar producto" }} />

      {isLoadingCategories && (
        <View className="flex-1 p-4">
          <Text className="text-[20px] dark:text-white">Cargando categorías...</Text>
        </View>
      )}

      {categoriesError && (
        <View className="flex-1 p-4">
          <Text className="text-[20px] dark:text-white">{categoriesError}</Text>
        </View>
      )}

      {!isLoadingCategories && !categoriesError && (
        <ProductForm
          onCreateCategory={addCategory}
          categories={categories}
          initialValues={{
            sku: product.sku,
            shortname: product.shortname,
            longname: product.longname,
            price: product.price.toString(),
            stock: product.stock.toString(),
            stockMin: product.stockMin.toString(),
            categoryId: product.categoryId.toString(),
            isActive: product.isActive,
          }}
          submitLabel="Guardar"
          onCancel={() => router.back()}
          onSubmit={async (values) => {
            const productWasUpdated: boolean = await updateProduct({
              id: product.id,
              sku: values.sku.trim(),
              shortname: values.shortname.trim(),
              longname: values.longname.trim(),
              price: values.price,
              stock: values.stock,
              stockMin: values.stockMin,
              categoryId: values.categoryId,
              isActive: values.isActive,
            });

            if (!productWasUpdated) {
              Alert.alert(
                "Error",
                "No se pudo actualizar el producto. Verificá que el SKU no esté duplicado e intentá nuevamente.",
              );
              return;
            }
            Alert.alert("Producto actualizado", `${values.shortname} fue actualizado correctamente.`, [
              {
                text: "Aceptar",
                onPress: () => router.back(),
              },
            ]);
          }}
        />
      )}
    </>
  );
}
