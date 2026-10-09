import { useCommerceFormat } from "@/hooks/use-commerce-format";
import { allowsFractionalQuantity, formatProductQuantity, getMeasurementUnit, isValidProductQuantity, lineAmount, parseDecimalInput } from "@almacen/shared";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useProducts } from "@/contexts/products";
import { usePurchaseDraft } from "@/contexts/purchase-draft";
import { usePurchaseSuppliers } from "@/hooks/use-purchase-suppliers";

export default function SelectSuppliersScreen() {
  const { formatCurrency } = useCommerceFormat();
  const [quantityTexts, setQuantityTexts] = useState<Record<string, string>>({});
  const { items, purchaseQuantities, updatePurchaseQuantity } = usePurchaseDraft();
  const { products, isLoadingProducts, productsError } = useProducts();
  const { suppliers, isLoadingSuppliers, suppliersError } = usePurchaseSuppliers();

  const isLoading = isLoadingProducts || isLoadingSuppliers;
  const loadingError = productsError || suppliersError;
  const assignedSuppliers = Object.values(purchaseQuantities).filter((quantity) => quantity > 0).length;

  const getPurchaseKey = (productId: number, supplierId: number) => `${productId}-${supplierId}`;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#071111]">
      <View className="mx-4 mt-4 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver a seleccionar productos"
            className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 active:opacity-70 dark:bg-slate-900"
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={21} color="#64748b" />
          </Pressable>

          <View className="flex-1">
            <Text className="text-xs font-black uppercase tracking-[1.4px] text-emerald-700 dark:text-emerald-400">
              Paso 2 de 3
            </Text>
            <Text className="mt-1 text-xl font-black text-slate-950 dark:text-white">Proveedores y cantidades</Text>
            <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Elegí cómo comprar cada producto.
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        className="mt-4 flex-1"
        data={items}
        keyExtractor={(item) => item.productId.toString()}
        contentContainerClassName="gap-3 px-4 pb-4"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View className="mt-4 items-center rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 dark:border-slate-700 dark:bg-slate-950">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
              <Ionicons name={isLoading ? "hourglass-outline" : "basket-outline"} size={27} color="#64748b" />
            </View>
            <Text className="mt-4 text-center text-lg font-black text-slate-950 dark:text-white">
              {isLoading
                ? "Cargando proveedores"
                : loadingError
                  ? "No pudimos cargar los datos"
                  : "No hay productos seleccionados"}
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-slate-500 dark:text-slate-400">
              {isLoading
                ? "Estamos preparando las opciones de compra."
                : loadingError || "Volvé al paso anterior y seleccioná al menos un producto."}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const product = products.find((currentProduct) => currentProduct.id === item.productId);
          const productSuppliers = suppliers.filter((supplier) =>
            supplier.products.some((supplierProduct) => supplierProduct.productId === item.productId),
          );
          const bestPrice =
            productSuppliers.length > 1
              ? Math.min(
                  ...productSuppliers.map((supplier) => {
                    const supplierProduct = supplier.products.find(
                      (currentProduct) => currentProduct.productId === item.productId,
                    );

                    return supplierProduct?.price ?? Infinity;
                  }),
                )
              : null;
          const stockNeeded =
            product?.stockMin != null && product?.stock != null && product.stock < product.stockMin
              ? Math.round((product.stockMin - product.stock) * 1000) / 1000
              : 0;

          return (
            <View className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <View className="flex-row items-start gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
                  <Ionicons name="cube-outline" size={22} color="#047857" />
                </View>

                <View className="flex-1">
                  <Text className="text-base font-black text-slate-950 dark:text-white">{item.shortname} · {getMeasurementUnit(item.measurementUnit).symbol}</Text>
                  <View className="mt-1 flex-row items-center gap-1.5">
                    <Ionicons
                      name={stockNeeded > 0 ? "alert-circle-outline" : "checkmark-circle-outline"}
                      size={15}
                      color={stockNeeded > 0 ? "#dc2626" : "#059669"}
                    />
                    <Text
                      className={`text-xs font-bold ${
                        stockNeeded > 0
                          ? "text-red-600 dark:text-red-300"
                          : "text-emerald-600 dark:text-emerald-300"
                      }`}>
                      {stockNeeded > 0 ? `Necesitás ${formatProductQuantity(stockNeeded, item.measurementUnit)}` : "El stock actual es suficiente"}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Text className="mb-2 text-xs font-black uppercase tracking-[1.2px] text-slate-400 dark:text-slate-500">
                  Proveedores disponibles
                </Text>

                {productSuppliers.length === 0 ? (
                  <View className="flex-row items-center gap-2 rounded-2xl bg-red-50 px-3 py-3 dark:bg-red-950/30">
                    <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />
                    <Text className="flex-1 text-sm font-bold text-red-600 dark:text-red-300">
                      No hay proveedores disponibles para este producto.
                    </Text>
                  </View>
                ) : (
                  <View className="gap-2">
                    {productSuppliers.map((supplier) => {
                      const key = getPurchaseKey(item.productId, supplier.id);
                      const quantity = purchaseQuantities[key] ?? 0;
                      const supplierProduct = supplier.products.find(
                        (currentProduct) => currentProduct.productId === item.productId,
                      );
                      const price = supplierProduct?.price ?? null;
                      const subtotal = price === null || !isValidProductQuantity(quantity, item.measurementUnit) ? 0 : lineAmount(quantity, price);
                      const isBestPrice = bestPrice !== null && price !== null && price === bestPrice;

                      return (
                        <View key={supplier.id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                          <View className="flex-row items-center justify-between gap-3">
                            <View className="flex-1">
                              <View className="flex-row flex-wrap items-center gap-2">
                                <Text className="text-sm font-black text-slate-900 dark:text-white">{supplier.name}</Text>
                                {isBestPrice && (
                                  <View className="flex-row items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 dark:bg-emerald-950/60">
                                    <Ionicons name="pricetag" size={11} color="#047857" />
                                    <Text className="text-[10px] font-black uppercase tracking-[0.7px] text-emerald-700 dark:text-emerald-300">
                                      Mejor precio
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                {price === null ? "Configurá el precio de compra en el proveedor" : formatCurrency(price) + " por " + getMeasurementUnit(item.measurementUnit).priceLabel}
                              </Text>
                            </View>

                            <View className="flex-row items-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Restar una unidad de ${supplier.name}`}
                                className="h-10 w-10 items-center justify-center active:bg-slate-100 dark:active:bg-slate-800"
                                disabled={price === null}
                                onPress={() => { const next = Math.round(Math.max(0, (Number.isFinite(quantity) ? quantity : 0) - 1) * 1000) / 1000; setQuantityTexts((current) => ({ ...current, [key]: String(next) })); updatePurchaseQuantity(item.productId, supplier.id, next); }}>
                                <Ionicons name="remove" size={18} color="#64748b" />
                              </Pressable>
                              <TextInput
                                accessibilityLabel={`Cantidad para ${supplier.name}`}
                                className="h-10 min-w-16 border-x border-slate-200 text-center text-sm font-black text-slate-950 dark:border-slate-700 dark:text-white"
                                placeholder="0"
                                placeholderTextColor="#94a3b8"
                                editable={price !== null}
                                value={quantityTexts[key] ?? (quantity > 0 ? String(quantity) : "")}
                                keyboardType={allowsFractionalQuantity(item.measurementUnit) ? "decimal-pad" : "number-pad"}
                                onChangeText={(value) => {
                                  setQuantityTexts((current) => ({ ...current, [key]: value }));
                                  const parsed = value.trim() ? parseDecimalInput(value) : 0;
                                  updatePurchaseQuantity(item.productId, supplier.id, parsed);
                                }}
                              />
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Agregar una unidad de ${supplier.name}`}
                                className="h-10 w-10 items-center justify-center active:bg-slate-100 dark:active:bg-slate-800"
                                disabled={price === null}
                                onPress={() => { const next = Math.round(((Number.isFinite(quantity) ? quantity : 0) + 1) * 1000) / 1000; setQuantityTexts((current) => ({ ...current, [key]: String(next) })); updatePurchaseQuantity(item.productId, supplier.id, next); }}>
                                <Ionicons name="add" size={18} color="#047857" />
                              </Pressable>
                            </View>
                          </View>

                          <View className="mt-3 flex-row items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">Subtotal</Text>
                            <Text className="text-sm font-black text-slate-950 dark:text-white">
                              {formatCurrency(subtotal)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />

      <View className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 dark:border-slate-800 dark:bg-slate-950">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
            <Ionicons name="storefront-outline" size={22} color="#047857" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-black text-slate-950 dark:text-white">
              {items.length} {items.length === 1 ? "producto" : "productos"}
            </Text>
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {assignedSuppliers > 0
                ? `${assignedSuppliers} ${assignedSuppliers === 1 ? "asignación cargada" : "asignaciones cargadas"}`
                : "Indicá las cantidades para continuar"}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continuar a revisar la compra"
          className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 active:opacity-80 dark:bg-emerald-600"
          onPress={() => {
            const invalid = Object.entries(purchaseQuantities).some(([key, value]) => {
              const productId = Number(key.split("-")[0]);
              const item = items.find((entry) => entry.productId === productId);
              return item && !isValidProductQuantity(value, item.measurementUnit);
            });
            if (invalid) { Alert.alert("Cantidad inválida", "Unidades y cajas requieren enteros; kg y litros admiten hasta tres decimales."); return; }
            if (items.some((item) => !Object.entries(purchaseQuantities).some(([key, value]) => key.startsWith(item.productId + "-") && value > 0))) {
              Alert.alert("Faltan cantidades", "Asigná al menos una cantidad a cada producto seleccionado."); return;
            }
            router.push("/(tabs)/purchases/new/review");
          }}>
          <Text className="text-base font-black text-white">Continuar</Text>
          <Ionicons name="arrow-forward" size={19} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
