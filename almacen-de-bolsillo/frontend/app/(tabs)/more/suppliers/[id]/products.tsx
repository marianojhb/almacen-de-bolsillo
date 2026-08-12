import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";

import type { Product, SupplierWithItems } from "@almacen/shared";
import { getSupplierProducts, updateSupplierProductsRequest } from "@/services/suppliersApi";
import { getProductsRequest } from "@/services/productsApi";

export default function SupplierProductsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const supplierId = Number(id);

  const [supplier, setSupplier] = useState<SupplierWithItems | null>(null);

  const [products, setProducts] = useState<Product[]>([]);

  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(() => new Set());

  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!Number.isInteger(supplierId) || supplierId <= 0) {
      Alert.alert("Proveedor inválido", "No se pudo identificar el proveedor.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [supplierResponse, productsResponse] = await Promise.all([
        getSupplierProducts(supplierId),
        getProductsRequest(false),
      ]);

      setSupplier(supplierResponse);
      setProducts(productsResponse);

      setSelectedProductIds(new Set(supplierResponse.products.map((product) => product.id)));
    } catch (error) {
      Alert.alert(
        "No se pudieron cargar los productos",
        error instanceof Error ? error.message : "Intentá nuevamente.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filteredProducts = products.filter((product) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        product.shortname.toLowerCase().includes(normalizedSearch) ||
        product.longname.toLowerCase().includes(normalizedSearch) ||
        product.sku?.toLowerCase().includes(normalizedSearch)
      );
    });

    return filteredProducts.sort((firstProduct, secondProduct) => {
      const firstIsSelected = selectedProductIds.has(firstProduct.id);

      const secondIsSelected = selectedProductIds.has(secondProduct.id);

      if (firstIsSelected && !secondIsSelected) {
        return -1;
      }

      if (!firstIsSelected && secondIsSelected) {
        return 1;
      }

      return firstProduct.shortname.localeCompare(secondProduct.shortname, "es");
    });
  }, [products, search, selectedProductIds]);

  const toggleProduct = (productId: number) => {
    setSelectedProductIds((current) => {
      const next = new Set(current);

      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }

      return next;
    });
  };

  const saveProducts = async () => {
    try {
      setIsSaving(true);

      const updatedSupplier = await updateSupplierProductsRequest(supplierId, {
        productIds: Array.from(selectedProductIds),
      });

      setSupplier(updatedSupplier);

      Alert.alert("Productos actualizados", "Los productos vinculados se guardaron correctamente.");
    } catch (error) {
      Alert.alert("No se pudieron guardar los cambios", error instanceof Error ? error.message : "Intentá nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Cargando Productos...</Text>
          <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Estamos cargando los productos del proveedor.
          </Text>
        </View>
      </View>
    );
  }

  if (!supplier) {
    return (
      <View className="flex-1 bg-gray-50 p-4 dark:bg-black">
        <Text className="text-lg text-gray-900 dark:text-white">Proveedor no encontrado.</Text>
      </View>
    );
  }

  return (
    <>
      {/* Header */}
      <Stack.Screen
        options={{
          title: `Lista de Productos`,
        }}
      />

      <View className="flex-1 bg-gray-50 px-4 pt-4 dark:bg-black">
        <Text className="text-2xl font-bold text-gray-950 dark:text-white">{supplier.name}</Text>

        <Text className="mb-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
          Seleccioná los productos que pertenecen a este proveedor.
        </Text>

        <View className="mb-4 flex-row items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar productos"
            className="h-12 flex-1 px-3 text-base text-black dark:text-white"
          />
        </View>

        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-semibold text-gray-700 dark:text-gray-200">
            {selectedProductIds.size} Productos vinculados
          </Text>

          <Pressable
            disabled={isSaving}
            onPress={saveProducts}
            className={`rounded-xl bg-[#111A1A] px-5 py-3 active:opacity-75 dark:bg-white ${
              isSaving ? "opacity-50" : ""
            }`}>
            <Text className="font-semibold text-white dark:text-black">{isSaving ? "Guardando..." : "Guardar"}</Text>
          </Pressable>
        </View>

        {/* Products list */}
        <FlatList
          data={visibleProducts}
          extraData={selectedProductIds}
          keyExtractor={(product) => product.id.toString()}
          contentContainerClassName="gap-3 pb-8"
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="cube-outline" size={48} color="#9ca3af" />

              <Text className="mt-4 text-gray-500 dark:text-gray-400">No se encontraron productos.</Text>
            </View>
          }
          renderItem={({ item: product }) => {
            const isSelected = selectedProductIds.has(product.id);

            return (
              //  Touch Product
              <Pressable
                onPress={() => toggleProduct(product.id)}
                className={`flex-row items-center rounded-xl border p-4 active:opacity-70 ${
                  isSelected
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                }`}>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-950 dark:text-white">{product.shortname}</Text>

                  <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">{product.longname}</Text>

                  {product.sku && (
                    <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</Text>
                  )}
                </View>

                <Ionicons
                  name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                  size={27}
                  color={isSelected ? "#16a34a" : "#9ca3af"}
                />
              </Pressable>
            );
          }}
        />
      </View>
    </>
  );
}
