import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { useProducts } from "@/contexts/products";
import { useSalesDraft } from "@/contexts/sales-draft";

export default function SelectProductsModal() {
  const { products, categories, isLoadingProducts, productsError } = useProducts();
  const { addItem } = useSalesDraft();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const filteredProducts = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = !categoryId || product.categoryId === Number(categoryId);
      const matchesSearchText =
        normalizedSearchText.length === 0 || product.shortname.toLowerCase().includes(normalizedSearchText);

      return matchesCategory && matchesSearchText;
    });
  }, [categoryId, products, searchText]);

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

      <View className="mb-4 flex-row flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = categoryId === category.id.toString();

          return (
            <Pressable
              key={category.id}
              onPress={() => setCategoryId(isSelected ? null : category.id.toString())}
              className={`rounded-full border px-4 py-2 active:opacity-75 ${
                isSelected
                  ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
              }`}>
              <Text
                className={`text-sm font-bold ${
                  isSelected ? "text-white dark:text-[#111A1A]" : "text-slate-700 dark:text-slate-200"
                }`}>
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

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
          contentContainerClassName="gap-3 pb-8"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          renderItem={({ item: product }) => {
            const quantity = quantities[product.id] ?? 1;
            const canAdd = quantity > 0;

            return (
              <View className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-2xl font-black text-slate-950 dark:text-white">{product.shortname}</Text>
                    <Text className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400" numberOfLines={2}>
                      #{product.id} · {product.longname}
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

                <View className="mt-4 flex-row flex-wrap gap-2">
                  <View className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">Stock: {product.stock}</Text>
                  </View>
                  <View className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">Mín: {product.stockMin}</Text>
                  </View>
                  <View className="rounded-full bg-indigo-50 px-3 py-1.5 dark:bg-indigo-950/60">
                    <Text className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{product.category.name}</Text>
                  </View>
                </View>

                <View className="mt-4 flex-row items-center gap-3">
                  <View className="flex-1">
                    <Text className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                      Cantidad
                    </Text>
                    <TextInput
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-base font-medium text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      placeholder="1"
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
                  </View>

                  <Pressable
                    className={`mt-6 rounded-2xl px-4 py-3 active:opacity-80 ${
                      canAdd ? "bg-[#111A1A] dark:bg-white" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    disabled={!canAdd}
                    onPress={() => {
                      addItem({
                        productId: product.id,
                        quantity,
                        shortname: product.shortname,
                        longname: product.longname,
                        price: product.price,
                        discount: 0,
                        subtotal: 0,
                      });
                      router.dismiss();
                    }}>
                    <Text
                      className={`text-sm font-black uppercase tracking-[1px] ${
                        canAdd ? "text-white dark:text-[#111A1A]" : "text-slate-500 dark:text-slate-300"
                      }`}>
                      Agregar
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
