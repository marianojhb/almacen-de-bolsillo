import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, Text, View } from "react-native";
import { useProducts } from "@/contexts/products";
import { useState, useEffect } from "react";
import type { Category, Product } from "@/types/Product";
import ProductForm from "@/components/ProductForm";
import { getCategories, createCategoryRequest } from "@/services/categoriesApi";

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, updateProduct } = useProducts();

  const product = products.find((currentProduct) => currentProduct.id === Number(id));
  const [productState, setProductState] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setProductState(product);
    }
  }, [product]);

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

  if (!product) {
    return (
      <View className="flex-1 p-4">
        <Text className="text-[20px] dark:text-white">Producto no encontrado.</Text>
      </View>
    );
  }
  const handleNewCategory = async (name: string) => {
    const createdCategory = await createCategoryRequest({ name });
    setCategories((currentCategories) => [...currentCategories, createdCategory]);
    return createdCategory;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `Edit: ${product?.shortname}`,
        }}
      />
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
          onCreateCategory={handleNewCategory}
          categories={categories}
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
          onSubmit={async (values) => {
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

            const wasUpdated = await updateProduct(updatedProduct);

            if (!wasUpdated) {
              Alert.alert(
                "Error",
                "No se pudo actualizar el producto. Verificá que el SKU no esté duplicado e intentá nuevamente.",
              );
              return;
            }
            Alert.alert("Producto actualizado", `${updatedProduct.shortname} fue actualizado correctamente.`, [
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
