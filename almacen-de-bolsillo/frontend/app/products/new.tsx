import { useProducts } from "@/contexts/products";
import { Alert, View, Text } from "react-native";
import { router, Stack } from "expo-router";
import ProductForm from "@/components/ProductForm";

export default function NewProductScreen() {
  const { addProduct, categories, addCategory, isLoadingCategories, categoriesError } = useProducts();

  return (
    <>
      <Stack.Screen options={{ title: "Nuevo producto" }} />

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
          submitLabel="Guardar"
          onCancel={() => router.back()}
          onSubmit={async (values) => {
            const productWasAdded = await addProduct(values);

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
    </>
  );
}
