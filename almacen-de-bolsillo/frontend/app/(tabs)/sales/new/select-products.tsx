import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProducts } from "@/contexts/products";
import { useSalesDraft } from "@/contexts/sales-draft";
import { ProductCategoryFilters } from "@/components/products/ProductCategoryFilters";
import { matchesProductFilters } from "@/utils/product-filters";

export default function SelectProductsModal() {
  const insets = useSafeAreaInsets();
  const { products, categories, isLoadingProducts, productsError } = useProducts();
  const { addItems } = useSalesDraft();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [inactiveOnly, setInactiveOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => matchesProductFilters(product, {
      categoryId, searchText, lowStockOnly, inactiveOnly,
    }));
  }, [categoryId, products, searchText, lowStockOnly, inactiveOnly]);

  const selectedProducts = products.filter((product) => (quantities[product.id] ?? 0) > 0);
  const selectedUnits = selectedProducts.reduce((total, product) => total + (quantities[product.id] ?? 0), 0);

  if (isLoadingProducts) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Cargando productos...</Text>
          <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Estamos preparando el catálogo para tu venta.
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
            No pudimos cargar productos
          </Text>
          <Text className="mt-2 text-center text-sm text-red-600 dark:text-red-200">{productsError}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-slate-50 px-4 pt-4 dark:bg-[#071111]"
      onStartShouldSetResponderCapture={() => {
        if (isSearchFocused) {
          Keyboard.dismiss();
        }

        return false;
      }}>
      <View className="mb-4 rounded-[28px] bg-[#111A1A] p-5 dark:bg-slate-950">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-300">Comercial</Text>
            <Text className="mt-1 text-4xl font-black text-white">Seleccionar productos</Text>
            <Text className="mt-2 text-sm leading-5 text-slate-300">
              {filteredProducts.length} de {products.length} productos disponibles para agregar a la venta
            </Text>
          </View>

          <Pressable
            className="rounded-2xl bg-white/10 px-4 py-3 active:opacity-80"
            onPress={() => router.dismiss()}>
            <Text className="text-center text-sm font-black uppercase tracking-[1px] text-white">Cerrar</Text>
          </Pressable>
        </View>
      </View>

      <View className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <Text className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
          Buscar
        </Text>
        <TextInput
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          placeholder="Filtrar por nombre"
          placeholderTextColor="#94a3b8"
          keyboardType="default"
          returnKeyType="search"
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>

      <ProductCategoryFilters
        className="mb-4 flex-none"
        categories={categories}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        lowStockOnly={lowStockOnly}
        onLowStockChange={setLowStockOnly}
        inactiveOnly={inactiveOnly}
        onInactiveChange={setInactiveOnly}
      />

      {products.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-16">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">No hay productos</Text>
            <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Agregá productos al inventario antes de crear una venta.
            </Text>
          </View>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-16">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">
              No encontramos resultados
            </Text>
            <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Probá con otro nombre o categoría.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="gap-2 pb-8"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          renderItem={({ item: product }) => {
            const quantity = quantities[product.id] ?? 0;

            return (
              <View className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="min-w-0 flex-1">
                    <Text className="text-lg font-black text-slate-950 dark:text-white" numberOfLines={1}>
                      {product.shortname}
                    </Text>
                    <View className="mt-0.5 flex-row items-center gap-2">
                      <Text className="min-w-0 flex-1 text-xs font-semibold text-slate-500 dark:text-slate-400" numberOfLines={1}>
                        {product.longname}
                      </Text>
                      <View className="rounded-full bg-indigo-50 px-2 py-0.5 dark:bg-indigo-950/60">
                        <Text className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300" numberOfLines={1}>
                          {product.category.name}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-[9px] font-bold uppercase tracking-[1px] text-emerald-600 dark:text-emerald-400">
                      Precio
                    </Text>
                    <Text className="text-base font-black text-emerald-700 dark:text-emerald-300">
                      {Number(product.price).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                    </Text>
                  </View>
                </View>

                <View className="mt-2 flex-row items-center gap-1.5">
                  <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Stock {product.stock} · Mín {product.stockMin}
                  </Text>

                  <View className="ml-auto flex-row items-center gap-1.5">
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Cant.</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Disminuir cantidad de ${product.shortname}`}
                      accessibilityState={{ disabled: quantity <= 0 }}
                      className={`h-8 w-8 items-center justify-center rounded-xl border active:opacity-70 ${
                        quantity <= 0
                          ? "border-slate-100 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
                          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
                      }`}
                      disabled={quantity <= 0}
                      onPress={() =>
                        setQuantities((currentQuantities) => {
                          const currentQuantity = currentQuantities[product.id] ?? 0;

                          return {
                            ...currentQuantities,
                            [product.id]: Math.max(currentQuantity - 1, 0),
                          };
                        })
                      }>
                      <Text
                        className={`text-lg font-black ${
                          quantity <= 0 ? "text-slate-300 dark:text-slate-600" : "text-slate-700 dark:text-slate-200"
                        }`}>
                        −
                      </Text>
                    </Pressable>
                    <TextInput
                      accessibilityLabel={`Cantidad de ${product.shortname}`}
                      className="w-10 rounded-xl border border-slate-200 bg-slate-50 px-1 py-1.5 text-center text-sm font-bold text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      placeholder="0"
                      placeholderTextColor="#94a3b8"
                      value={quantity.toString()}
                      onChangeText={(text) => {
                        const nextQuantity = Number.parseInt(text, 10) || 0;

                        setQuantities((currentQuantities) => ({
                          ...currentQuantities,
                          [product.id]: nextQuantity,
                        }));
                      }}
                      keyboardType="numeric"
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Aumentar cantidad de ${product.shortname}`}
                      className="h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white active:opacity-70 dark:border-slate-700 dark:bg-slate-950"
                      onPress={() =>
                        setQuantities((currentQuantities) => {
                          const currentQuantity = currentQuantities[product.id] ?? 0;

                          return {
                            ...currentQuantities,
                            [product.id]: currentQuantity + 1,
                          };
                        })
                      }>
                      <Text className="text-lg font-black text-slate-700 dark:text-slate-200">+</Text>
                    </Pressable>

                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <View
        className="border-t border-slate-200 bg-slate-50 pt-3 dark:border-slate-800 dark:bg-[#071111]"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <Text className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          {selectedProducts.length} {selectedProducts.length === 1 ? "producto" : "productos"} · {selectedUnits}{" "}
          {selectedUnits === 1 ? "unidad" : "unidades"}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Agregar ${selectedProducts.length} productos a la venta`}
          accessibilityState={{ disabled: selectedProducts.length === 0 }}
          className={`mt-2 items-center rounded-2xl px-4 py-3 active:opacity-80 ${
            selectedProducts.length === 0 ? "bg-slate-300 dark:bg-slate-700" : "bg-[#111A1A] dark:bg-white"
          }`}
          disabled={selectedProducts.length === 0}
          onPress={() => {
            addItems(
              selectedProducts.map((product) => ({
                productId: product.id,
                quantity: quantities[product.id],
                shortname: product.shortname,
                longname: product.longname,
                price: product.price,
                discount: 0,
                subtotal: 0,
              })),
            );
            Keyboard.dismiss();
            router.dismiss();
          }}>
          <Text
            className={`text-sm font-black ${
              selectedProducts.length === 0 ? "text-slate-500 dark:text-slate-300" : "text-white dark:text-[#111A1A]"
            }`}>
            Agregar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
