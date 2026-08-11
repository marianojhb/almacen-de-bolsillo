import { CreateSalesOrderDto } from "@almacen/shared";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSales } from "@/contexts/sales";
import { useSalesDraft } from "@/contexts/sales-draft";

export const NewSaleScreen = () => {
  const { items, totalAmount, removeItem, clearSales } = useSalesDraft();
  const { addSale, refreshSales } = useSales();

  const [inputDiscount, setInputDiscount] = useState("");
  const [metodoDePago, setMetodoDePago] = useState<"EFECTIVO" | "MERCADOPAGO" | "UALA">("EFECTIVO");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [isSavingSale, setIsSavingSale] = useState(false);

  const discount = Math.round(Number(totalAmount) * (Number(inputDiscount || 0) / 100) * 100) / 100;
  const baseImponible = Math.round((Number(totalAmount) - discount) * 100) / 100;
  const iva = Math.round(baseImponible * 0.21 * 100) / 100;
  const totalConIVA = Math.round((baseImponible + iva) * 100) / 100;

  const isDisabled = items.length === 0 || isSavingSale;

  async function handleAddSale() {
    const payload: CreateSalesOrderDto = {
      invoice: numeroFactura,
      sellerId: 3,
      paymentMethod: metodoDePago,
      discount,
      iva,
      total: totalConIVA,
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
      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-8 pt-4">
        <View className="rounded-[28px] bg-[#111A1A] p-5 dark:bg-slate-950">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-300">Comercial</Text>
              <Text className="mt-1 text-4xl font-black text-white">Nueva venta</Text>
              <Text className="mt-2 text-sm leading-5 text-slate-300">
                {items.length} productos cargados · Total estimado{" "}
                {Number(totalConIVA).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </Text>
            </View>

            <Pressable
              className="rounded-2xl bg-white/10 px-4 py-3 active:opacity-80"
              onPress={() => router.push("/sales/new/select-products")}>
              <Text className="text-center text-sm font-black uppercase tracking-[1px] text-white">Agregar items</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
          onPress={() => router.push("/sales/new/select-products")}>
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-lg font-black text-slate-950 dark:text-white">Productos seleccionados</Text>
            <Text className="text-xs font-bold uppercase tracking-[1px] text-emerald-600 dark:text-emerald-400">
              Editar
            </Text>
          </View>

          {items.length === 0 ? (
            <Text className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Todavía no agregaste productos. Tocá esta tarjeta para cargar artículos a la venta.
            </Text>
          ) : (
            <View className="mt-4 gap-3">
              {items.map((item) => (
                <View
                  key={item.productId}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-lg font-black text-slate-950 dark:text-white">{item.shortname}</Text>
                      <Text className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400" numberOfLines={2}>
                        {item.longname}
                      </Text>
                    </View>

                    <Pressable
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 dark:border-red-900/60 dark:bg-red-950/30"
                      onPress={() => removeItem(item.productId)}>
                      <Text className="text-xs font-black uppercase tracking-[1px] text-red-600 dark:text-red-300">
                        Quitar
                      </Text>
                    </Pressable>
                  </View>

                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <View className="rounded-full bg-slate-200 px-3 py-1.5 dark:bg-slate-800">
                      <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">Cantidad: {item.quantity}</Text>
                    </View>
                    <View className="rounded-full bg-slate-200 px-3 py-1.5 dark:bg-slate-800">
                      <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Unitario: {Number(item.price).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                      </Text>
                    </View>
                    <View className="rounded-full bg-emerald-50 px-3 py-1.5 dark:bg-emerald-950/60">
                      <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        Subtotal: {Number(item.quantity * item.price).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              <View className="rounded-2xl bg-[#111A1A] p-4 dark:bg-slate-900">
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400">Subtotal de productos</Text>
                <Text className="mt-1 text-3xl font-black text-white">
                  {Number(totalAmount).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                </Text>
              </View>
            </View>
          )}
        </Pressable>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-lg font-black text-slate-950 dark:text-white">Datos de facturación</Text>

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
              <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">Ingresá el porcentaje de descuento total.</Text>
            </View>
          </View>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-lg font-black text-slate-950 dark:text-white">Resumen de importes</Text>

          <View className="mt-4 gap-4">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Subtotal</Text>
              <Text className="text-base font-black text-slate-950 dark:text-white">
                {Number(totalAmount).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Descuento</Text>
              <Text className="text-base font-black text-red-600 dark:text-red-300">
                -{Number(discount).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Base imponible</Text>
              <Text className="text-base font-black text-slate-950 dark:text-white">
                {Number(baseImponible).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">IVA 21%</Text>
              <Text className="text-base font-black text-slate-950 dark:text-white">
                {Number(iva).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </Text>
            </View>

            <View className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-emerald-700 dark:text-emerald-300">
                Total a pagar
              </Text>
              <Text className="mt-1 text-4xl font-black text-emerald-700 dark:text-emerald-300">
                {Number(totalConIVA).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </Text>
              <Text className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-200">IVA incluido.</Text>
            </View>
          </View>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-lg font-black text-slate-950 dark:text-white">Método de pago</Text>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {[
              { value: "EFECTIVO", label: "Efectivo" },
              { value: "MERCADOPAGO", label: "Mercado Pago" },
              { value: "UALA", label: "Ualá" },
            ].map((method) => {
              const isSelected = metodoDePago === method.value;

              return (
                <Pressable
                  key={method.value}
                  className={`rounded-full border px-4 py-3 active:opacity-75 ${
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

        <View className="gap-3 pb-2">
          <Pressable
            className={`items-center rounded-2xl p-4 active:opacity-80 ${isDisabled ? "bg-slate-300 dark:bg-slate-700" : "bg-[#111A1A] dark:bg-white"}`}
            onPress={handleAddSale}
            disabled={isDisabled}>
            <Text className={`text-base font-black ${isDisabled ? "text-slate-500 dark:text-slate-300" : "text-white dark:text-[#111A1A]"}`}>
              {isSavingSale ? "Guardando venta..." : "Guardar venta"}
            </Text>
          </Pressable>

          <Pressable
            className="items-center rounded-2xl border border-slate-300 bg-white p-4 active:opacity-80 dark:border-slate-700 dark:bg-slate-950"
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
