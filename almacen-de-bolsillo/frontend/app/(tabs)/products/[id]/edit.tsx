import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, Text, View } from "react-native";
import { useProducts } from "@/contexts/products";
import { ProductForm } from "@/components/products";

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
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Cargando producto...</Text>
          <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Buscando la información del producto.
          </Text>
        </View>
      </View>
    );
  }

  if (productsError) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-red-100 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/30">
          <Text className="text-center text-xl font-bold text-red-700 dark:text-red-300">
            No pudimos cargar el producto
          </Text>
          <Text className="mt-2 text-center text-sm text-red-600 dark:text-red-200">{productsError}</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Producto no encontrado.</Text>
          <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Es posible que haya sido eliminado o que el identificador sea incorrecto.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#071111]">
      <Stack.Screen options={{ title: "Editar producto" }} />

      {isLoadingCategories && (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Cargando categorías...</Text>
          </View>
        </View>
      )}

      {categoriesError && (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full rounded-3xl border border-red-100 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/30">
            <Text className="text-center text-xl font-bold text-red-700 dark:text-red-300">
              No pudimos cargar categorías
            </Text>
            <Text className="mt-2 text-center text-sm text-red-600 dark:text-red-200">{categoriesError}</Text>
          </View>
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
            supplierIds: product.suppliers?.map((supplier) => supplier.id) ?? [],
          }}
          submitLabel="Guardar"
          onCancel={() => router.back()}
          onSubmit={async (values) => {
            const productWasUpdated: boolean = await updateProduct(
              {
                sku: values.sku.trim(),
                shortname: values.shortname.trim(),
                longname: values.longname.trim(),
                description: product.description,
                price: values.price,
                stock: values.stock,
                stockMin: values.stockMin,
                discount: product.discount,
                categoryId: values.categoryId,
                supplierIds: values.supplierIds,
                isActive: values.isActive,
              },
              product.id,
            );

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
    </View>
  );
}
