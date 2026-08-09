import { FlatList, Text, View, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import NewProductButton from "@/components/products/NewProductButton";
import { useProducts } from "@/contexts/products";
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

  if (isLoadingProducts) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Cargando productos...</Text>
          <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Estamos preparando tu inventario.
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
    <View className="flex-1 bg-slate-50 px-4 pt-4 dark:bg-[#071111]">
      <View className="mb-4 rounded-[28px] bg-[#111A1A] p-5 dark:bg-slate-950">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-300">Inventario</Text>
            <Text className="mt-1 text-4xl font-black text-white">Productos</Text>
            <Text className="mt-2 text-sm leading-5 text-slate-300">
              {filteredProducts.length} de {products.length} productos visibles
            </Text>
          </View>

          <NewProductButton />
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
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View className="mb-4 flex-row flex-wrap gap-2">
        <Pressable
          key="inactive"
          onPress={() => setIsSelected(!isSelected)}
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
              onPress={() => setCategoryId(isCategorySelected ? null : category.id.toString())}
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

      {products.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-16">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">No hay productos</Text>
            <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Agregá tu primer producto para empezar a gestionar el stock.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(product) => product.id.toString()}
          contentContainerClassName="gap-3 pb-8"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-950">
              <Text className="text-center text-lg font-bold text-slate-950 dark:text-white">Sin coincidencias</Text>
              <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                Probá con otro nombre o cambiá los filtros seleccionados.
              </Text>
            </View>
          }
          renderItem={({ item: product }) => {
            const hasLowStock = product.stock <= product.stockMin;

            return (
              <Pressable
                onPress={() => router.push(`/products/${product.id}`)}
                className="rounded-3xl active:scale-[0.98] active:opacity-80">
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
                        ${product.price.toLocaleString("es-AR")}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <View className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                      <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Stock: {product.stock}
                      </Text>
                    </View>
                    <View className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                      <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Mín: {product.stockMin}
                      </Text>
                    </View>
                    <View className="rounded-full bg-indigo-50 px-3 py-1.5 dark:bg-indigo-950/60">
                      <Text className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        {product.category.name}
                      </Text>
                    </View>
                    <View
                      className={`rounded-full px-3 py-1.5 ${
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
                      <View className="rounded-full bg-red-50 px-3 py-1.5 dark:bg-red-950/60">
                        <Text className="text-xs font-black text-red-600 dark:text-red-300">Stock bajo</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
