import { useProducts } from "@/contexts/products";
import { Alert, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import ProductForm from "@/components/ProductForm";
import { useEffect, useState } from "react";
import { getCategories } from "@/services/categoriesApi";
import type { Category } from "@/types/Product";

export default function NewProductScreen() {
  const { addProduct } = useProducts();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setCategoriesError(null);
        const categories = await getCategories();
        setCategories(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoriesError("Error fetching categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

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
