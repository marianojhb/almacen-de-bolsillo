import { CreateSalesOrderDto } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSales } from "@/contexts/sales";
import { useSalesDraft } from "@/contexts/sales-draft";
import { useAuth } from "@/contexts/AuthContext";

export const NewSaleScreen = () => {
  const { user } = useAuth();
  const { items, totalAmount, removeItem, clearSales } = useSalesDraft();
  const { addSale, refreshSales } = useSales();

  const [inputDiscount, setInputDiscount] = useState("");
  const [metodoDePago, setMetodoDePago] = useState<"EFECTIVO" | "MERCADOPAGO" | "UALA">("EFECTIVO");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [isSavingSale, setIsSavingSale] = useState(false);
  const [isProductsExpanded, setIsProductsExpanded] = useState(false);
  const [isBillingExpanded, setIsBillingExpanded] = useState(false);

  const subtotal = Math.round(Number(totalAmount) * 100) / 100;
  const discount = (Number(inputDiscount || 0) / 100) * 100;
  const total = Math.round((Number(totalAmount) - discount) * 100) / 100;
  const taxableBase = Math.round((subtotal - discount)/1.21 * 100) / 100;
  const ivaSales = Math.round(taxableBase * 0.21 * 100) / 100;

  const isDisabled = items.length === 0 || isSavingSale;

  async function handleAddSale() {
    if (!user || isDisabled) return;
    const payload: CreateSalesOrderDto = {
      invoice: numeroFactura,
      sellerId: user.id,
      paymentMethod: metodoDePago,
      subtotal: subtotal,
      discount: discount,
      taxableBase: taxableBase,
      ivaSales: ivaSales,
      total: total,
      salesOrderItems: items.map((item) => ({
        productId: item.productId,
        shortname: item.shortname,
        longname: item.longname,
        quantity: item.quantity,
        price: item.price,
        discount: 0,
        subtotal: item.quantity * item.price,
      })),
    };

    setIsSavingSale(true);
    await addSale(payload);
    clearSales();
    await refreshSales();
    router.replace("/sales");
    setIsSavingSale(false);
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#071111]">
      <ScrollView className="flex-1" contentContainerClassName="gap-2 px-4 pb-4 pt-4">
        <View className="rounded-3xl bg-[#111A1A] p-4 dark:bg-slate-950">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xs font-semibold text-emerald-300">Comercial</Text>
              <Text className="mt-0.5 text-2xl font-black text-white">Nueva venta</Text>
            </View>

            <Pressable
              className="min-w-[116px] rounded-2xl bg-white/10 px-3 py-2.5 active:opacity-80"
              onPress={() => router.push("/sales/new/select-products")}>
              <Text className="text-center text-sm font-black text-white">Agregar items</Text>
            </Pressable>
          </View>
          <Text className="mt-1 text-xs leading-5 text-slate-300">
            {items.length} productos cargados · Total estimado{" "}
            {Number(total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
          </Text>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: isProductsExpanded }}
            accessibilityLabel={`${isProductsExpanded ? "Ocultar" : "Mostrar"} productos seleccionados`}
            className="flex-row items-center justify-between gap-3 active:opacity-70"
            onPress={() => setIsProductsExpanded((current) => !current)}>
            <View className="flex-1">
              <Text className="text-base font-black text-slate-950 dark:text-white">Productos seleccionados</Text>
              <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {items.length} {items.length === 1 ? "producto" : "productos"} · {Number(totalAmount).toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </Text>
            </View>
            <Ionicons
              name={isProductsExpanded ? "chevron-up" : "chevron-down"}
              size={22}
              color="#64748b"
            />
          </Pressable>

          {isProductsExpanded && (
            <View className="mt-3 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              {items.length === 0 ? (
                <Text className="text-sm text-slate-500 dark:text-slate-400">
                  Todavía no agregaste productos.
                </Text>
              ) : (
                items.map((item) => (
                  <View
                    key={item.productId}
                    className="rounded-2xl bg-slate-50 px-3 py-2.5 dark:bg-slate-900">
                    <View className="flex-row items-center gap-3">
                      <View className="h-9 min-w-9 items-center justify-center rounded-xl bg-[#111A1A] px-2 dark:bg-white">
                        <Text className="text-base font-black text-white dark:text-[#111A1A]">{item.quantity}</Text>
                      </View>
                      <Text className="flex-1 text-sm font-black text-slate-950 dark:text-white" numberOfLines={1}>
                        {item.shortname}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Quitar ${item.shortname}`}
                        className="ml-auto rounded-full bg-red-50 px-2.5 py-1.5 active:opacity-70 dark:bg-red-950/30"
                        onPress={() => removeItem(item.productId)}>
                        <Text className="text-xs font-black text-red-600 dark:text-red-300">Quitar</Text>
                      </Pressable>
                    </View>

                    <View className="ml-12 mt-1.5 flex-row items-center gap-3">
                      <View className="flex-1 justify-center">
                        <Text className="text-[9px] font-bold uppercase tracking-[1px] text-slate-400 dark:text-slate-500">
                          Unitario
                        </Text>
                        <Text className="mt-0.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                          {Number(item.price).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                        </Text>
                      </View>
                      <View className="flex-1 items-end justify-center">
                        <Text className="text-[9px] font-bold uppercase tracking-[1px] text-emerald-600 dark:text-emerald-400">
                          Subtotal
                        </Text>
                        <Text className="mt-0.5 text-sm font-black text-emerald-700 dark:text-emerald-300">
                          {Number(item.quantity * item.price).toLocaleString("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: isBillingExpanded }}
            accessibilityLabel={`${isBillingExpanded ? "Ocultar" : "Mostrar"} datos de facturación`}
            className="flex-row items-center justify-between gap-3 active:opacity-70"
            onPress={() => setIsBillingExpanded((current) => !current)}>
            <View className="flex-1">
              <Text className="text-base font-black text-slate-950 dark:text-white">Datos de facturación</Text>
              <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Número de factura y descuento
              </Text>
            </View>
            <Ionicons
              name={isBillingExpanded ? "chevron-up" : "chevron-down"}
              size={22}
              color="#64748b"
            />
          </Pressable>

          {isBillingExpanded && (
            <View className="mt-4 gap-4">
              <View>
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                  Número de factura
                </Text>
                <TextInput
                  className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  placeholder="Opcional"
                  placeholderTextColor="#94a3b8"
                  value={numeroFactura}
                  onChangeText={setNumeroFactura}
                />
              </View>

              <View>
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                  Descuento aplicado
                </Text>
                <TextInput
                  className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  value={inputDiscount}
                  onChangeText={setInputDiscount}
                  keyboardType="numeric"
                />
                <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Ingresá el porcentaje de descuento total.
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-base font-black text-slate-950 dark:text-white">Resumen de importes</Text>

          <View className="mt-2 gap-1.5">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Subtotal</Text>
              <Text className="text-sm font-black text-slate-950 dark:text-white">
                {Number(totalAmount).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Descuento</Text>
              <Text className="text-sm font-black text-red-600 dark:text-red-300">
                -{Number(discount).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total sin IVA</Text>
              <Text className="text-sm font-black text-slate-950 dark:text-white">
                {Number(taxableBase).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">IVA 21%</Text>
              <Text className="text-sm font-black text-slate-950 dark:text-white">
                {Number(ivaSales).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </Text>
            </View>

            <View className="mt-1 flex-row items-center justify-between gap-3 rounded-2xl bg-emerald-50 px-3 py-2.5 dark:bg-emerald-950/30">
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-[1px] text-emerald-700 dark:text-emerald-300">
                  Total a pagar
                </Text>
                <Text className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-200">IVA incluido</Text>
              </View>
              <Text className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {Number(total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-base font-black text-slate-950 dark:text-white">Método de pago</Text>

          <View className="mt-2 flex-row flex-wrap gap-1.5">
            {[
              { value: "EFECTIVO", label: "Efectivo" },
              { value: "MERCADOPAGO", label: "Mercado Pago" },
              { value: "UALA", label: "Ualá" },
            ].map((method) => {
              const isSelected = metodoDePago === method.value;

              return (
                <Pressable
                  key={method.value}
                  className={`rounded-full border px-3 py-2 active:opacity-75 ${
                    isSelected
                      ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  }`}
                  onPress={() => setMetodoDePago(method.value as "EFECTIVO" | "MERCADOPAGO" | "UALA")}>
                  <Text
                    className={`text-sm font-bold ${
                      isSelected ? "text-white dark:text-[#111A1A]" : "text-slate-700 dark:text-slate-200"
                    }`}>
                    {method.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="flex-row gap-2 pb-1">
          <Pressable
            className={`flex-1 items-center rounded-2xl px-3 py-3 active:opacity-80 ${isDisabled ? "bg-slate-300 dark:bg-slate-700" : "bg-[#111A1A] dark:bg-white"}`}
            onPress={handleAddSale}
            disabled={isDisabled}>
            <Text
              className={`text-base font-black ${isDisabled ? "text-slate-500 dark:text-slate-300" : "text-white dark:text-[#111A1A]"}`}>
              {isSavingSale ? "Guardando venta..." : "Guardar venta"}
            </Text>
          </Pressable>

          <Pressable
            className="flex-1 items-center rounded-2xl border border-slate-300 bg-white px-3 py-3 active:opacity-80 dark:border-slate-700 dark:bg-slate-950"
            onPress={() => {
              clearSales();
              router.back();
            }}>
            <Text className="text-base font-bold text-slate-700 dark:text-slate-200">Cancelar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default NewSaleScreen;
