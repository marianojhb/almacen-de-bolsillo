import { useState, useMemo } from "react";
import {
  Keyboard,
  FlatList,
  Pressable,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useProducts } from "@/contexts/products";
import { ProductWithRelations } from "@almacen/shared";

// import { usePurchaseDraft } from "@/contexts/purchase-draft";
// import { createPurchaseOrderRequest } from "@/services/purchasesApi";
import { Ionicons } from "@expo/vector-icons";

export default function NewPurchaseScreen() {
  const colorScheme = useColorScheme();
  const [isOnlyMissingProducts, setIsOnlyMissingProducts] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductWithRelations[]>([]);
  const {
    products,
    categories,
    isLoadingProducts,
    isLoadingCategories,
    productsError,
    refreshProducts,
    refreshCategories,
  } = useProducts();

  const filteredProducts = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const matchesOnlyMissingProducts = !isOnlyMissingProducts || product.stock < product.stockMin; // Si isOnlyMissingProducts es true, solo mostrar productos con stock menor al mínimo

      const matchesCategory = !categoryId || product.categoryId === Number(categoryId); // Si categoryId es null, mostrar todos los productos; de lo contrario, solo mostrar productos de la categoría seleccionada

      const matchesSearchText =
        normalizedSearchText.length === 0 || product.shortname.toLowerCase().includes(normalizedSearchText);

      const activeProducts = !isSelected || product.isActive === false; // Si isSelected es true, solo mostrar productos inactivos
      return matchesSearchText && matchesCategory && matchesSearchText && activeProducts && matchesOnlyMissingProducts;
    });
  }, [categoryId, products, searchText, isSelected, isOnlyMissingProducts]);

  if (productsError) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-red-100 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/30">
          <Text className="text-center text-xl font-bold text-red-700 dark:text-red-300">
            No pudimos cargar productos
          </Text>
          <Text className="mt-2 text-center text-sm text-red-600 dark:text-red-200">{productsError}</Text>
        </View>
      </View>
    );
  }
  const handleRefresh = async () => {
    await Promise.all([refreshProducts(), refreshCategories()]);
  };

  const toggleProductSelected = (productId: number) => {
    // Aquí puedes implementar la lógica para seleccionar o deseleccionar un producto
    console.log(`Producto seleccionado/deseleccionado: ${productId}`);
    setSelectedProducts((prev) => {
      const isCurrentlySelected = prev.some((p) => p.id === productId);
      if (isCurrentlySelected) {
        return prev.filter((p) => p.id !== productId);
      } else {
        return [...prev, products.find((p) => p.id === productId)!];
      }
    });
    console.log(selectedProducts);
  };

  return (
    <>
      <View className="flex-1 p-4">
        <View className="flex-row items-start">
          <Pressable onPress={() => router.back()} className="mr-3 pt-2">
            <Ionicons name="arrow-back" size={24} color={colorScheme === "dark" ? "#9ca3af" : "black"} />
          </Pressable>

          <View className="flex-1">
            <Text className="text-base font-bold dark:text-white ">1. Elegir productos</Text>
            <Text className="mt-1 text-sm text-gray-600">Seleccioná los productos que querés comprar</Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-base">
            <Ionicons name="cart" size={18} color={colorScheme === "dark" ? "#9ca3af" : "black"} /> Solo faltantes
          </Text>
          <Switch value={isOnlyMissingProducts} onValueChange={setIsOnlyMissingProducts} />
        </View>

        <View className="mt-3 flex-row items-center rounded-lg border border-gray-300 p-4">
          <Ionicons name="search" size={18} color="#9ca3af" />

          <TextInput
            className="ms-2 flex-1 text-sm text-gray-600"
            placeholder="Buscar productos"
            value={searchText}
            onChangeText={setSearchText}
          />
          <Text>{searchText}</Text>
        </View>

        {/* Filtrado por categoría */}
        <View className="mt-1 mb-4 flex-row flex-wrap gap-2">
          <Pressable
            key="inactive"
            onPress={() => {
              Keyboard.dismiss();
              setIsSelected(!isSelected);
            }}
            className={`rounded-full border px-4 py-2 active:opacity-75 ${
              isSelected
                ? "border-amber-500 bg-amber-500 dark:border-amber-400 dark:bg-amber-400"
                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
            }`}>
            <Text
              className={`text-sm font-bold ${isSelected ? "text-white dark:text-slate-950" : "text-slate-700 dark:text-slate-200"}`}>
              Inactivos
            </Text>
          </Pressable>

          {categories.map((category) => {
            const isCategorySelected = categoryId === category.id.toString();

            return (
              <Pressable
                key={category.id}
                onPress={() => {
                  Keyboard.dismiss();
                  setCategoryId(isCategorySelected ? null : category.id.toString());
                }}
                className={`rounded-full border px-4 py-2 active:opacity-75 ${
                  isCategorySelected
                    ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                }`}>
                <Text
                  className={`text-sm font-bold ${
                    isCategorySelected ? "text-white dark:text-[#111A1A]" : "text-slate-700 dark:text-slate-200"
                  }`}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isLoadingProducts || isLoadingCategories} onRefresh={handleRefresh} />
          }
          renderItem={({ item: product }) => {
            const relation = selectedProducts.find((current) => current.id === product.id);
            const selected = relation !== undefined;

            return (
              <Pressable onPress={() => toggleProductSelected(product.id)}>
                <View className="flex-row mt-2 rounded-lg border border-gray-300 p-4  ">
                  <View className={`mr-4 h-6 w-6 items-center justify-center rounded-full border ${selected ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                    <Text>{selected ? "✓" : "+"}</Text>
                  </View>
                  <View>
                    <View className="">
                      <Text className="text-sm font-bold"> {product.shortname}</Text>
                    </View>

                    <Text className="text-sm text-gray-600">{product.longname}</Text>
                    <View className="flex-row items-center justify-between mt-2">
                      <Text
                        className={`justify-start text-sm text-gray-600 ${product?.stockMin > product?.stock ? "text-red-500" : "text-green-500"}`}>
                        Stock: {product.stock}
                      </Text>
                      <Text className="text-sm text-gray-600">Mínimo: {product.stockMin}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            isLoadingProducts ? (
              <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
                <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                  <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">
                    Cargando productos...
                  </Text>
                  <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                    Estamos preparando tu inventario.
                  </Text>
                </View>
              </View>
            ) : products.length === 0 ? (
              <View className="flex-1 items-center justify-center pb-16">
                <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                  <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">
                    No hay productos
                  </Text>
                  <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                    Agregá tu primer producto para empezar a gestionar el stock.
                  </Text>
                </View>
              </View>
            ) : (
              <View className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-950">
                <Text className="text-center text-lg font-bold text-slate-950 dark:text-white">Sin coincidencias</Text>
                <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                  Probá con otro nombre o cambiá los filtros seleccionados.
                </Text>
              </View>
            )
          }
        />

        <View className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
              <Ionicons
                name="basket-outline"
                size={22}
                color={colorScheme === "dark" ? "#6ee7b7" : "#047857"}
              />
            </View>

            <View className="flex-1">
              <Text className="text-base font-black text-slate-950 dark:text-white">
                {selectedProducts.length}{" "}
                {selectedProducts.length === 1 ? "producto seleccionado" : "productos seleccionados"}
              </Text>
              <Text className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {selectedProducts.length > 0
                  ? "Revisá la selección y continuá con el proveedor."
                  : "Elegí al menos un producto para continuar."}
              </Text>
            </View>

            {selectedProducts.length > 0 && (
              <Pressable
                accessibilityLabel="Eliminar selección de productos"
                className="flex-row items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 active:opacity-70 dark:bg-red-950/40"
                onPress={() => setSelectedProducts([])}>
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={colorScheme === "dark" ? "#fca5a5" : "#dc2626"}
                />
                <Text className="text-xs font-black text-red-600 dark:text-red-300">Limpiar</Text>
              </Pressable>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continuar a seleccionar proveedor"
            disabled={selectedProducts.length === 0}
            className={`mt-4 flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4 active:opacity-80 ${
              selectedProducts.length === 0 ? "bg-slate-200 dark:bg-slate-800" : "bg-emerald-700 dark:bg-emerald-600"
            }`}
            onPress={() => router.push("/(tabs)/purchases/new/select-suppliers")}>
            <Text
              className={`text-base font-black ${
                selectedProducts.length === 0 ? "text-slate-400 dark:text-slate-500" : "text-white"
              }`}>
              Continuar
            </Text>
            <Ionicons
              name="arrow-forward"
              size={19}
              color={selectedProducts.length === 0 ? (colorScheme === "dark" ? "#64748b" : "#94a3b8") : "white"}
            />
          </Pressable>
        </View>
      </View>
    </>
  );
}
