import { FlatList, Keyboard, Text, View, Pressable, TextInput, RefreshControl } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { NewProductButton } from "@/components/products";
import { useProducts } from "@/contexts/products";
import { useCallback, useState, useMemo } from "react";
import { ProductCategoryFilters } from "@/components/products/ProductCategoryFilters";
import { matchesProductFilters } from "@/utils/product-filters";
import { NotebookHeading } from "@/components/ui/notebook";

export default function ProductsScreen() {
  const {
    products,
    categories,
    isLoadingProducts,
    isLoadingCategories,
    productsError,
    refreshProducts,
    refreshCategories,
  } = useProducts();
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => matchesProductFilters(product, {
      categoryId, searchText, lowStockOnly, inactiveOnly: isSelected,
    }));
  }, [categoryId, products, searchText, isSelected, lowStockOnly]);

  useFocusEffect(
    useCallback(() => {
      void Promise.all([refreshProducts(), refreshCategories()]);
    }, [refreshCategories, refreshProducts]),
  );

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

  return (
    <View
      className="flex-1 bg-transparent px-6 pt-4"
      onStartShouldSetResponderCapture={() => {
        if (isSearchFocused) {
          Keyboard.dismiss();
        }

        return false;
      }}>
      <NotebookHeading subtitle={`${filteredProducts.length} de ${products.length} productos visibles`}>La estantería</NotebookHeading>
      <View className="mb-4 flex-row items-center gap-2">
        <TextInput
          accessibilityLabel="Buscar productos por nombre"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white/60 px-3 py-3 text-base text-ink dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          placeholder="Buscar producto"
          placeholderTextColor="#94a3b8"
          keyboardType="default"
          returnKeyType="search"
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onSubmitEditing={Keyboard.dismiss}
        />
        <NewProductButton />
      </View>

      <ProductCategoryFilters
        className="mb-4 flex-none"
        categories={categories}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        lowStockOnly={lowStockOnly}
        onLowStockChange={setLowStockOnly}
        inactiveOnly={isSelected}
        onInactiveChange={setIsSelected}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(product) => product.id.toString()}
        contentContainerClassName="gap-2 pb-8"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
                <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">No hay productos</Text>
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
        refreshControl={
          <RefreshControl refreshing={isLoadingProducts || isLoadingCategories} onRefresh={handleRefresh} />
        }
        renderItem={({ item: product }) => {
          const hasLowStock = product.stock <= product.stockMin;

          return (
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                router.push(`/products/${product.id}`);
              }}
              className="border-b border-slate-200 active:opacity-70 dark:border-slate-700">
              <View className="py-4">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-ink dark:text-white">{product.shortname}</Text>
                    <Text className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400" numberOfLines={2}>
                      {product.longname}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-xs font-bold uppercase tracking-[1px] text-emerald-600 dark:text-emerald-400">
                      Precio
                    </Text>
                    <Text className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                      {Number(product.price).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                    </Text>
                  </View>
                </View>

                <View className="mt-3 flex-row flex-wrap gap-1.5">
                  <View className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-900">
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">Stock: {product.stock}</Text>
                  </View>
                  <View className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-900">
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Mín: {product.stockMin}
                    </Text>
                  </View>
                  <View className="rounded-full bg-indigo-50 px-2.5 py-1 dark:bg-indigo-950/60">
                    <Text className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {product.category.name}
                    </Text>
                  </View>
                  <View
                    className={`rounded-full px-2.5 py-1 ${
                      product.isActive ? "bg-emerald-50 dark:bg-emerald-950/60" : "bg-slate-100 dark:bg-slate-900"
                    }`}>
                    <Text
                      className={`text-xs font-bold ${
                        product.isActive
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-slate-500 dark:text-slate-400"
                      }`}>
                      {product.isActive ? "Activo" : "Inactivo"}
                    </Text>
                  </View>
                  {hasLowStock && (
                    <View className="rounded-full bg-red-50 px-2.5 py-1 dark:bg-red-950/60">
                      <Text className="text-xs font-black text-red-600 dark:text-red-300">Stock bajo</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
