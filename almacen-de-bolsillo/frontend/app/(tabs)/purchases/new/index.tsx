import { useMemo, useState } from "react";
import { FlatList, Keyboard, Pressable, RefreshControl, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { ProductWithRelations, PurchaseDraftItem } from "@almacen/shared";
import { useProducts } from "@/contexts/products";
import { usePurchaseDraft } from "@/contexts/purchase-draft";

export default function NewPurchaseScreen() {
  const [isOnlyMissingProducts, setIsOnlyMissingProducts] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isSelected, setIsSelected] = useState(false);
  // const [selectedProducts, setSelectedProducts] = useState<ProductWithRelations[]>([]);
  const {
    products,
    categories,
    isLoadingProducts,
    isLoadingCategories,
    productsError,
    refreshProducts,
    refreshCategories,
  } = useProducts();

  const { items, toggleProduct, clearPurchase } = usePurchaseDraft();

  const filteredProducts = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const matchesOnlyMissingProducts = !isOnlyMissingProducts || product.stock < product.stockMin;
      const matchesCategory = !categoryId || product.categoryId === Number(categoryId);
      const matchesSearchText =
        normalizedSearchText.length === 0 || product.shortname.toLowerCase().includes(normalizedSearchText);
      const matchesInactiveFilter = !isSelected || product.isActive === false;

      return matchesSearchText && matchesCategory && matchesInactiveFilter && matchesOnlyMissingProducts;
    });
  }, [categoryId, products, searchText, isSelected, isOnlyMissingProducts]);

  const handleRefresh = async () => {
    await Promise.all([refreshProducts(), refreshCategories()]);
  };

  const toggleProductSelected = (product: ProductWithRelations) => {
    const draftItem: PurchaseDraftItem = {
      productId: product.id,
      shortname: product.shortname,
      longname: product.longname,
      supplierId: null,
      quantity: 0,
      price: 0,
      discount: 0,
      subtotal: 0,
    };

    const isCurrentlySelected = items.some((selectedProduct) => selectedProduct.productId === product.id);

    if (isCurrentlySelected) {
      toggleProduct(draftItem); // Update the item in the draft
      return;
    }

    const productToAdd = !isCurrentlySelected ? draftItem : null;
    if (productToAdd) {
      toggleProduct(productToAdd); // Add the item to the draft
    }
  };

  if (productsError) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-[28px] border border-red-100 bg-white p-6 shadow-sm dark:border-red-900/60 dark:bg-slate-950">
          <View className="mx-auto h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40">
            <Ionicons name="cloud-offline-outline" size={28} color="#dc2626" />
          </View>
          <Text className="mt-4 text-center text-xl font-black text-slate-950 dark:text-white">
            No pudimos cargar productos
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-slate-500 dark:text-slate-400">{productsError}</Text>
          <Pressable
            accessibilityRole="button"
            className="mt-5 items-center rounded-2xl bg-slate-950 px-4 py-3.5 active:opacity-75 dark:bg-white"
            onPress={handleRefresh}>
            <Text className="font-black text-white dark:text-slate-950">Volver a intentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <>
      {/* CHECK
      <View>
        <Text>{items.map((item) => item.shortname)}</Text>
      </View> */}
      <View className="flex-1 bg-slate-50 dark:bg-[#071111]">
        <View className="mx-4 mt-4 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
            <Ionicons name="search" size={19} color="#64748b" />
            <TextInput
              accessibilityLabel="Buscar productos"
              className="ml-3 h-12 flex-1 text-base font-medium text-slate-950 dark:text-white"
              placeholder="Buscar por nombre"
              placeholderTextColor="#94a3b8"
              returnKeyType="search"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpiar búsqueda"
                className="h-8 w-8 items-center justify-center rounded-full bg-slate-200 active:opacity-70 dark:bg-slate-700"
                onPress={() => setSearchText("")}>
                <Ionicons name="close" size={17} color="#94a3b8" />
              </Pressable>
            )}
          </View>

          <View className="mt-3 flex-row items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 dark:bg-amber-950/30">
            <View className="mr-4 flex-1 flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
                <Ionicons name="alert-circle-outline" size={20} color="#b45309" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-black text-amber-900 dark:text-amber-100">Sólo faltantes</Text>
                <Text className="text-xs text-amber-700 dark:text-amber-300">Stock por debajo del mínimo</Text>
              </View>
            </View>
            <Switch
              accessibilityLabel="Mostrar solamente productos faltantes"
              value={isOnlyMissingProducts}
              onValueChange={setIsOnlyMissingProducts}
            />
          </View>
        </View>

        <View className="mt-4">
          <View className="mb-2 flex-row items-center justify-between px-4">
            <Text className="text-xs font-black uppercase tracking-[1.4px] text-slate-400 dark:text-slate-500">
              Filtrar por
            </Text>
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {filteredProducts.length} {filteredProducts.length === 1 ? "resultado" : "resultados"}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 px-4 pb-2"
            keyboardShouldPersistTaps="handled">
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setIsSelected((current) => !current);
              }}
              className={`flex-row items-center gap-2 rounded-full border px-4 py-2.5 active:opacity-75 ${
                isSelected
                  ? "border-amber-500 bg-amber-500 dark:border-amber-400 dark:bg-amber-400"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
              }`}>
              <Ionicons name="archive-outline" size={16} color={isSelected ? "#ffffff" : "#64748b"} />
              <Text
                className={`text-sm font-black ${
                  isSelected ? "text-white dark:text-slate-950" : "text-slate-700 dark:text-slate-200"
                }`}>
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
                  className={`rounded-full border px-4 py-2.5 active:opacity-75 ${
                    isCategorySelected
                      ? "border-slate-950 bg-slate-950 dark:border-white dark:bg-white"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  }`}>
                  <Text
                    className={`text-sm font-black ${
                      isCategorySelected ? "text-white dark:text-slate-950" : "text-slate-700 dark:text-slate-200"
                    }`}>
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <FlatList
          className="mt-1 flex-1"
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="gap-3 px-4 pb-4 pt-2"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isLoadingProducts || isLoadingCategories}
              onRefresh={handleRefresh}
              tintColor="#047857"
            />
          }
          renderItem={({ item: product }) => {
            const selected = items.some((current) => current.productId === product.id);
            const isBelowMinimum = product.stock < product.stockMin;
            const missingUnits = Math.max(product.stockMin - product.stock, 0);

            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${product.shortname}, stock ${product.stock}`}
                onPress={() => toggleProductSelected(product)}
                className={`overflow-hidden rounded-[24px] border bg-white p-4 active:opacity-80 dark:bg-slate-950 ${
                  selected ? "border-emerald-500 dark:border-emerald-600" : "border-slate-200 dark:border-slate-800"
                }`}>
                <View className="flex-row items-start gap-3">
                  <View
                    className={`mt-0.5 h-11 w-11 items-center justify-center rounded-2xl ${
                      selected ? "bg-emerald-600" : "bg-slate-100 dark:bg-slate-900"
                    }`}>
                    <Ionicons
                      name={selected ? "checkmark" : "cube-outline"}
                      size={22}
                      color={selected ? "white" : "#64748b"}
                    />
                  </View>

                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-start justify-between gap-2">
                      <Text className="flex-1 text-base font-black text-slate-950 dark:text-white" numberOfLines={1}>
                        {product.shortname}
                      </Text>
                      {!product.isActive && (
                        <View className="rounded-full bg-amber-100 px-2.5 py-1 dark:bg-amber-950/50">
                          <Text className="text-[10px] font-black uppercase tracking-wide text-amber-700 dark:text-amber-300">
                            Inactivo
                          </Text>
                        </View>
                      )}
                    </View>
                    {product.longname ? (
                      <Text className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400" numberOfLines={2}>
                        {product.longname}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View className="mt-4 flex-row gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <View
                    className={`flex-1 rounded-2xl px-3 py-2.5 ${
                      isBelowMinimum ? "bg-red-50 dark:bg-red-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"
                    }`}>
                    <Text
                      className={`text-[10px] font-black uppercase tracking-wide ${
                        isBelowMinimum ? "text-red-500 dark:text-red-300" : "text-emerald-600 dark:text-emerald-300"
                      }`}>
                      Stock actual
                    </Text>
                    <Text
                      className={`mt-0.5 text-lg font-black ${
                        isBelowMinimum ? "text-red-700 dark:text-red-200" : "text-emerald-700 dark:text-emerald-200"
                      }`}>
                      {product.stock}
                    </Text>
                  </View>
                  <View className="flex-1 rounded-2xl bg-slate-50 px-3 py-2.5 dark:bg-slate-900">
                    <Text className="text-[10px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Stock mínimo
                    </Text>
                    <Text className="mt-0.5 text-lg font-black text-slate-700 dark:text-slate-200">
                      {product.stockMin}
                    </Text>
                  </View>
                </View>

                {isBelowMinimum && (
                  <View className="mt-3 flex-row items-center gap-2">
                    <Ionicons name="trending-down-outline" size={15} color="#dc2626" />
                    <Text className="text-xs font-bold text-red-600 dark:text-red-300">
                      Faltan {missingUnits} {missingUnits === 1 ? "unidad" : "unidades"} para alcanzar el mínimo
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View className="mt-8 items-center rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 dark:border-slate-700 dark:bg-slate-950">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
                <Ionicons
                  name={
                    isLoadingProducts ? "hourglass-outline" : products.length === 0 ? "cube-outline" : "search-outline"
                  }
                  size={27}
                  color="#64748b"
                />
              </View>
              <Text className="mt-4 text-center text-lg font-black text-slate-950 dark:text-white">
                {isLoadingProducts
                  ? "Cargando productos"
                  : products.length === 0
                    ? "Todavía no hay productos"
                    : "Sin coincidencias"}
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-slate-500 dark:text-slate-400">
                {isLoadingProducts
                  ? "Estamos preparando tu inventario."
                  : products.length === 0
                    ? "Agregá productos antes de crear una compra."
                    : "Probá con otro nombre o cambiá los filtros."}
              </Text>
            </View>
          }
        />

        <View className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 dark:border-slate-800 dark:bg-slate-950">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
              <Ionicons name="basket-outline" size={22} color="#047857" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-black text-slate-950 dark:text-white">
                {items.length} {items.length === 1 ? "producto" : "productos"}
              </Text>
              <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {items.length > 0 ? "Listos para asignar proveedor" : "Seleccioná para continuar"}
              </Text>
            </View>
            {items.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpiar selección"
                className="h-10 w-10 items-center justify-center rounded-xl bg-red-50 active:opacity-70 dark:bg-red-950/40"
                onPress={() => clearPurchase()}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </Pressable>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continuar a seleccionar proveedor"
            accessibilityState={{ disabled: items.length === 0 }}
            disabled={items.length === 0}
            className={`mt-3 flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4 active:opacity-80 ${
              items.length === 0 ? "bg-slate-200 dark:bg-slate-800" : "bg-emerald-700 dark:bg-emerald-600"
            }`}
            onPress={() => router.push("/(tabs)/purchases/new/select-suppliers")}>
            <Text
              className={`text-base font-black ${
                items.length === 0 ? "text-slate-400 dark:text-slate-500" : "text-white"
              }`}>
              Continuar
            </Text>
            <Ionicons name="arrow-forward" size={19} color={items.length === 0 ? "#94a3b8" : "white"} />
          </Pressable>
        </View>
      </View>
    </>
  );
}
