import { FlatList, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import NewProductButton from "@/components/NewProductButton";
import { useProducts } from "@/contexts/products";
import ListAllProductsButton from "@/components/ListAllProductsButton";
import { useState } from "react";

export default function ProductsScreen() {
  const { products, isLoadingProducts, productsError } = useProducts();
  const [showInactiveProducts, setShowInactiveProducts] = useState(true);

  const filteredProducts = products.filter((product) => product.isActive === true);
  let visibleProducts = showInactiveProducts ? products : filteredProducts;

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
              <ListAllProductsButton
                showInactiveProducts={showInactiveProducts}
                onPress={() => setShowInactiveProducts(!showInactiveProducts)}
              />
              <NewProductButton />
            </View>
          </View>

          <FlatList
            data={visibleProducts}
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
                        <Text className="font-semibold dark:text-white">{product.longname}</Text>
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
