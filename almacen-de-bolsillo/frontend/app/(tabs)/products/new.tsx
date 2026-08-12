import { useProducts } from "@/contexts/products";
import { Alert, View, Text } from "react-native";
import { router } from "expo-router";
import { ProductForm } from "@/components/products";

export default function NewProductScreen() {
  const { addProduct, categories, addCategory, isLoadingCategories, categoriesError } = useProducts();

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#071111]">
      {isLoadingCategories && (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Cargando categorías...</Text>
            <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Preparando el formulario del producto.
            </Text>
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
          submitLabel="Guardar"
          onCancel={() => router.back()}
          onSubmit={async (values) => {
            const productWasAdded = await addProduct({
              sku: values.sku,
              shortname: values.shortname,
              longname: values.longname,
              description: null,
              price: values.price,
              stock: values.stock,
              stockMin: values.stockMin,
              discount: null,
              categoryId: values.categoryId,
              supplierIds: values.supplierIds,
              isActive: values.isActive,
            });

            if (!productWasAdded) {
              Alert.alert("SKU duplicado", "Ya existe un producto registrado con ese SKU.");
              return;
            }

            Alert.alert("Producto registrado", `${values.shortname.trim()} fue registrado correctamente.`, [
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
