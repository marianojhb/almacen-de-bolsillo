import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";

import type { Product } from "@almacen/shared";
import { useSuppliers } from "@/contexts/suppliers";
import { getProductsRequest } from "@/services/productsApi";

export default function SupplierProductsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Validate supplier ID
  const supplierId = Number(id);

  const { suppliers, isLoadingSuppliers, suppliersError, updateSupplier } = useSuppliers();

  // Find the supplier by ID
  const supplier = useMemo(
    () => suppliers.find((currentSupplier) => currentSupplier.id === supplierId) ?? null,
    [supplierId, suppliers],
  );

  const [products, setProducts] = useState<Product[]>([]);

  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(() => new Set());

  const [search, setSearch] = useState("");

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  // Estados para manejar las propiedades de los productos
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [supplierCategory, setSupplierCategory] = useState<Record<number, string>>({});
  const [unitsPerPaq, setUnitsPerPaq] = useState<Record<number, string>>({});
  const [pricePerPaq, setPricePerPaq] = useState<Record<number, string>>({});
  const [minimumQuantity, setMinimumQuantity] = useState<Record<number, string>>({});
  const [salesTerms, setSalesTerms] = useState<Record<number, string>>({});
  const [leadTimeDays, setLeadTimeDays] = useState<Record<number, string>>({});

  // Helpers:

  const toNullableString = (value?: string) => {
    const trimmedValue = value?.trim();

    return trimmedValue ? trimmedValue : null;
  };

  const toNullableNumber = (value?: string) => {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
      return null;
    }

    const numberValue = Number(trimmedValue);

    return Number.isNaN(numberValue) ? null : numberValue;
  };

  const toRequiredNumber = (value?: string) => {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
      return null;
    }

    const numberValue = Number(trimmedValue);

    return Number.isNaN(numberValue) ? null : numberValue;
  };

  useEffect(() => {
    if (!supplier) {
      return;
    }
    // Initialize selectedProductIds with the products of the supplier
    setSelectedProductIds(() => {
      return new Set([...supplier.products.map((product) => product.productId)]);
    });
    const initialPrices: Record<number, string> = {};
    const initialSupplierCategory: Record<number, string> = {};
    const initialUnitsPerPaq: Record<number, string> = {};
    const initialPricePerPaq: Record<number, string> = {};
    const initialMinimumQuantity: Record<number, string> = {};
    const initialSalesTerms: Record<number, string> = {};
    const initialLeadTimeDays: Record<number, string> = {};

    supplier.products.forEach((product) => {
      initialPrices[product.productId] = product.price?.toString() ?? "";
      initialSupplierCategory[product.productId] = product.supplierCategory ?? "";
      initialUnitsPerPaq[product.productId] = product.unitsPerPaq?.toString() ?? "";
      initialPricePerPaq[product.productId] = product.pricePerPaq.toString();
      initialMinimumQuantity[product.productId] = product.minimumQuantity?.toString() ?? "";
      initialSalesTerms[product.productId] = product.salesTerms ?? "";
      initialLeadTimeDays[product.productId] = product.leadTimeDays?.toString() ?? "";
    });

    setPrices(initialPrices);
    setSupplierCategory(initialSupplierCategory);
    setUnitsPerPaq(initialUnitsPerPaq);
    setPricePerPaq(initialPricePerPaq);
    setMinimumQuantity(initialMinimumQuantity);
    setSalesTerms(initialSalesTerms);
    setLeadTimeDays(initialLeadTimeDays);
  }, [supplier]);

  // Load products from the API

  useEffect(() => {
    if (!Number.isInteger(supplierId) || supplierId <= 0) {
      Alert.alert("Proveedor inválido", "No se pudo identificar el proveedor.");

      setIsLoadingProducts(false);
      return;
    }

    let cancelled = false;

    async function loadProducts() {
      try {
        setIsLoadingProducts(true);

        const response = await getProductsRequest(false);

        if (!cancelled) {
          setProducts(response);
        }
      } catch (error) {
        if (!cancelled) {
          Alert.alert(
            "No se pudieron cargar los productos",
            error instanceof Error ? error.message : "Intentá nuevamente.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [supplierId]);

  // Filter and sort products based on search and selection
  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filteredProducts = products.filter((product) => {
      if (!normalizedSearch) {
        return true;
      }

      // Check if the product's shortname, longname, or SKU includes the search term
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

      const updateOrCreateSupplierProducts = Array.from(selectedProductIds).map((productId) => {
        const parsedPricePerPaq = toRequiredNumber(pricePerPaq[productId]);

        if (parsedPricePerPaq === null) {
          throw new Error("Todos los productos seleccionados deben tener precio por paquete.");
        }

        return {
          productId,
          price: toNullableNumber(prices[productId]),
          supplierCategory: toNullableString(supplierCategory[productId]),
          unitsPerPaq: toNullableNumber(unitsPerPaq[productId]),
          pricePerPaq: parsedPricePerPaq,
          minimumQuantity: toNullableNumber(minimumQuantity[productId]),
          salesTerms: toNullableString(salesTerms[productId]),
          leadTimeDays: toNullableNumber(leadTimeDays[productId]),
        };
      });

      await updateSupplier(supplierId, {
        productIds: updateOrCreateSupplierProducts,
      });

      Alert.alert("Productos actualizados", "Los productos vinculados se guardaron correctamente.");
    } catch (error) {
      Alert.alert("No se pudieron guardar los cambios", error instanceof Error ? error.message : "Intentá nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingSuppliers || isLoadingProducts;
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

  if (suppliersError) {
    return (
      <View className="flex-1 bg-gray-50 p-4 dark:bg-black">
        <Text className="text-lg text-red-700 dark:text-red-300">{suppliersError}</Text>
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

  const styles = {
    inputField: {
      label: "mt-2 p-2 text-sm font-medium text-gray-700 dark:text-gray-300",
      input:
        "mt-1 h-12 p-3 border border-green-500 rounded-xl align-center text-sm font-semibold text-green-700 dark:text-green-400",
    },
  };

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

                  {isSelected && (
                    <View>
                      <Text className={styles.inputField.label}>Precio de compra</Text>
                      <TextInput
                        className={styles.inputField.input}
                        placeholder="Ingrese el precio"
                        value={prices[product.id] ?? ""}
                        onChangeText={(text) => {
                          setPrices((prevPrices) => ({
                            ...prevPrices,
                            [product.id]: text,
                          }));
                        }}
                      />
                    </View>
                  )}
                  {isSelected && (
                    <View>
                      <Text className={styles.inputField.label}>Categoría del proveedor</Text>
                      <TextInput
                        className={styles.inputField.input}
                        placeholder="Ingrese la categoría"
                        value={supplierCategory[product.id] ?? ""}
                        onChangeText={(text) => {
                          setSupplierCategory((prevCategory) => ({
                            ...prevCategory,
                            [product.id]: text,
                          }));
                        }}
                      />
                    </View>
                  )}
                  {isSelected && (
                    <View>
                      <Text className={styles.inputField.label}>Unidades por paquete</Text>
                      <TextInput
                        className={styles.inputField.input}
                        placeholder="Ingrese las unidades por paquete"
                        value={unitsPerPaq[product.id] ?? ""}
                        onChangeText={(text) => {
                          setUnitsPerPaq((prevUnitsPerPaq) => ({
                            ...prevUnitsPerPaq,
                            [product.id]: text,
                          }));
                        }}
                      />
                    </View>
                  )}
                  {isSelected && (
                    <View>
                      <Text className={styles.inputField.label}>Precio por paquete</Text>
                      <TextInput
                        className={styles.inputField.input}
                        placeholder="Ingrese el precio por paquete"
                        value={pricePerPaq[product.id] ?? ""}
                        onChangeText={(text) => {
                          setPricePerPaq((prevPricePerPaq) => ({
                            ...prevPricePerPaq,
                            [product.id]: text,
                          }));
                        }}
                      />
                    </View>
                  )}
                  {isSelected && (
                    <View>
                      <Text className={styles.inputField.label}>Cantidad mínima</Text>
                      <TextInput
                        className={styles.inputField.input}
                        placeholder="Ingrese la cantidad mínima"
                        value={minimumQuantity[product.id] ?? ""}
                        onChangeText={(text) => {
                          setMinimumQuantity((prevMinimumQuantity) => ({
                            ...prevMinimumQuantity,
                            [product.id]: text,
                          }));
                        }}
                      />
                    </View>
                  )}
                  {isSelected && (
                    <View>
                      <Text className={styles.inputField.label}>Condiciones de venta</Text>
                      <TextInput
                        className={styles.inputField.input}
                        placeholder="Ingrese las condiciones de venta"
                        value={salesTerms[product.id] ?? ""}
                        onChangeText={(text) => {
                          setSalesTerms((prevSalesTerms) => ({
                            ...prevSalesTerms,
                            [product.id]: text,
                          }));
                        }}
                      />
                    </View>
                  )}
                  {isSelected && (
                    <View>
                      <Text className={styles.inputField.label}>Tiempo de entrega (días)</Text>
                      <TextInput
                        className={styles.inputField.input}
                        placeholder="Ingrese el tiempo de entrega (días)"
                        value={leadTimeDays[product.id] ?? ""}
                        onChangeText={(text) => {
                          setLeadTimeDays((prevLeadTimeDays) => ({
                            ...prevLeadTimeDays,
                            [product.id]: text,
                          }));
                        }}
                      />
                    </View>
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
