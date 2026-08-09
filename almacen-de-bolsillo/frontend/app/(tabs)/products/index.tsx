import { FlatList, Text, View, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import NewProductButton from "@/components/products/NewProductButton";
import { useProducts } from "@/contexts/products";
import ListAllProductsButton from "@/components/products/ListAllProductsButton";
import { useState, useMemo } from "react";

export default function ProductsScreen() {
  const { products, isLoadingProducts, productsError, categories } = useProducts();
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState<string>("");
  const [isSelected, setIsSelected] = useState(false);

  const filteredProducts = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = !categoryId || product.categoryId === Number(categoryId);

      const matchesSearchText =
        normalizedSearchText.length === 0 || product.shortname.toLowerCase().includes(normalizedSearchText);

      const activeProducts = !isSelected || product.isActive === false; // Si isSelected es true, solo mostrar productos inactivos
      return matchesCategory && matchesSearchText && activeProducts;
    });
  }, [categoryId, products, searchText, isSelected]);

  return (
    // container
    <>
      {isLoadingProducts && (
        <View className="flex-1 p-4">
          <Text className="text-[20px] dark:text-white">Cargando productos...</Text>
        </View>
      )}
      {productsError && (
        <View className="flex-1 p-4">
          <Text className="text-[20px] dark:text-white">{productsError}</Text>
        </View>
      )}
      {!isLoadingProducts && !productsError && products.length === 0 && (
        <View className="flex-1 p-4">
          <Text className="text-[20px] dark:text-white">No hay productos...</Text>
        </View>
      )}
      {!isLoadingProducts && !productsError && (
        <>
          <View className="mb-4 flex-row items-center justify-end  px-2 py-1">
            <Text className="text-3xl font-bold dark:text-white">Productos</Text>
            <View className="ml-auto flex-row gap-2">
              <NewProductButton />
            </View>
          </View>
          {/* ------------- */}
          <View className="flex-row gap-2 items-center">
            <Text className="text-black dark:text-white">Buscar</Text>
            <TextInput
              className="flex-1 border border-black rounded-lg w-32 text-start p-2 text-sm  dark:text-white"
              placeholder="Filtrar por nombre"
              placeholderTextColor="#9ca3af"
              keyboardType="default"
              onChangeText={setSearchText}></TextInput>
          </View>
          <View className="flex-flow flex-wrap flex-row justify-start gap-4 gap-x-8">
            <Pressable
              key="all"
              onPress={() => setIsSelected(!isSelected)}
              className={`w-22 px-2 py-1 border rounded-xl items-stretch ${
                isSelected ? "border-[#111A1A] bg-[#111A1A] dark:bg-white" : "border-gray-300 bg-white dark:bg-black"
              }`}>
              <Text
                className={`text-sm ${isSelected ? "text-white text-base dark:text-black" : "text-black dark:text-white"}`}>
                Inactivos
              </Text>
            </Pressable>

            {categories.map((category) => {
              const isSelected = categoryId === category.id.toString();

              return (
                <Pressable
                  key={category.id}
                  onPress={() => setCategoryId(category.id.toString())}
                  className={`w-22 px-2 py-1 border rounded-xl items-stretch ${
                    isSelected
                      ? "border-[#111A1A] bg-[#111A1A] dark:bg-white"
                      : "border-gray-300 bg-white dark:bg-black"
                  }`}>
                  <Text
                    className={`text-sm ${isSelected ? "text-white text-base dark:text-black" : "text-black dark:text-white"}`}>
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {/* ------------- */}

          <FlatList
            data={filteredProducts}
            keyExtractor={(product) => product.id.toString()}
            renderItem={({ item: product }) => {
              const hasLowStock = product.stock <= product.stockMin;

              return (
                <>
                  <Pressable
                    onPress={() => router.push(`/products/${product.id}`)}
                    className="rounded-xl  active:scale-[0.98] active:opacity-70  ">
                    <View className="flex flex-row justify-between items-center p-4 mb-3 bg-white dark:bg-gray-900 border border-[#d4d4d4] dark:border-gray-600 rounded-xl ">
                      <View className="gap-1">
                        <Text className="text-[22px] font-semibold dark:text-white pb-2">{product.shortname}</Text>
                        <Text className="font-semibold dark:text-white">
                          [{product.id}] {product.longname}
                        </Text>
                        <Text className="text-base dark:text-white">
                          Precio: ${product.price.toLocaleString("es-AR")}
                        </Text>
                        <Text className="dark:text-white">Stock: {product.stock}</Text>
                        <Text className="dark:text-white">Stock mínimo: {product.stockMin}</Text>
                        <Text className="dark:text-white">Categoría: {product.category.name}</Text>
                        <Text className="dark:text-white">Estado: {product.isActive ? "Activo" : "Inactivo"}</Text>
                      </View>
                      {/* alerta de bajo stock */}
                      {hasLowStock && <Text className="font-bold text-red-500">Stock bajo</Text>}
                    </View>
                  </Pressable>
                </>
              );
            }}
          />
        </>
      )}
    </>
  );
}
