import { useCommerceFormat } from "@/hooks/use-commerce-format";
import { PAYMENT_METHODS, WALLET_PROVIDERS, formatProductQuantity, getMeasurementUnit, isValidDecimal, parseDecimalInput, lineAmount, type PaymentMethod, type WalletProvider, type CreateSalesOrderDto } from "@almacen/shared";
import { SearchSelect } from "@/components/forms/SearchSelect";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSales } from "@/contexts/sales";
import { useSalesDraft } from "@/contexts/sales-draft";

export const NewSaleScreen = () => {
  const { formatCurrency } = useCommerceFormat();
  const { items, totalAmount, removeItem, clearSales } = useSalesDraft();
  const { addSale, refreshSales } = useSales();

  const [inputDiscount, setInputDiscount] = useState("");
  const [metodoDePago, setMetodoDePago] = useState<PaymentMethod>("CASH");
  const [walletProvider, setWalletProvider] = useState<WalletProvider>("MERCADOPAGO");
  const saving = useRef(false);
  const [numeroFactura, setNumeroFactura] = useState("");
  const [isSavingSale, setIsSavingSale] = useState(false);

  const subtotal = Math.round(Number(totalAmount) * 100) / 100;
  const discount = inputDiscount.trim() ? parseDecimalInput(inputDiscount) : 0;
  const total = Math.round((Number(totalAmount) - discount) * 100) / 100;
  const taxableBase = Math.round((subtotal - discount)/1.21 * 100) / 100;
  const ivaSales = Math.round((total - taxableBase) * 100) / 100;

  const isDisabled = items.length === 0 || isSavingSale;

  async function handleAddSale() {
    if (saving.current || isDisabled) return;
    if (!isValidDecimal(discount, 2) || discount > 99999999.99 || discount > subtotal) { Alert.alert("Descuento inválido", "Ingresá un importe válido que no supere el subtotal."); return; }
    const payload: CreateSalesOrderDto = {
      invoice: numeroFactura,
      paymentMethod: metodoDePago,
      walletProvider: metodoDePago === "VIRTUAL_WALLET" ? walletProvider : null,
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
        subtotal: lineAmount(item.quantity, item.price),
      })),
    };

    saving.current = true;
    setIsSavingSale(true);
    try {
      if (!(await addSale(payload))) { Alert.alert("No se pudo guardar", "Revisá los permisos e intentá nuevamente."); return; }
      clearSales();
      await refreshSales();
      router.replace("/sales");
    } catch (error) {
      Alert.alert("No se pudo guardar", error instanceof Error ? error.message : "Intentá nuevamente.");
    } finally { saving.current = false; setIsSavingSale(false); }
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
                {formatCurrency(total)}
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
                      <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Cantidad: {formatProductQuantity(item.quantity, item.measurementUnit)}
                      </Text>
                    </View>
                    <View className="rounded-full bg-slate-200 px-3 py-1.5 dark:bg-slate-800">
                      <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Por {getMeasurementUnit(item.measurementUnit).priceLabel}: {formatCurrency(item.price)}
                      </Text>
                    </View>
                    <View className="rounded-full bg-emerald-50 px-3 py-1.5 dark:bg-emerald-950/60">
                      <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        Subtotal:{" "}
                        {formatCurrency(lineAmount(item.quantity, item.price))}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              <View className="rounded-2xl bg-[#111A1A] p-4 dark:bg-slate-900">
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400">
                  Subtotal de productos
                </Text>
                <Text className="mt-1 text-3xl font-black text-white">
                  {formatCurrency(totalAmount)}
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
              <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Ingresá el importe del descuento total.
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-lg font-black text-slate-950 dark:text-white">Resumen de importes</Text>

          <View className="mt-4 gap-4">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Subtotal</Text>
              <Text className="text-base font-black text-slate-950 dark:text-white">
                {formatCurrency(totalAmount)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Descuento</Text>
              <Text className="text-base font-black text-red-600 dark:text-red-300">
                -{formatCurrency(discount)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total a pagar</Text>
              <Text className="text-base font-black text-slate-950 dark:text-white">
                {formatCurrency(total)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total sin IVA</Text>
              <Text className="text-base font-black text-slate-950 dark:text-white">
                {formatCurrency(taxableBase)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">IVA 21%</Text>
              <Text className="text-base font-black text-slate-950 dark:text-white">
                {formatCurrency(ivaSales)}
              </Text>
            </View>

            <View className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-emerald-700 dark:text-emerald-300">
                Total a pagar
              </Text>
              <Text className="mt-1 text-4xl font-black text-emerald-700 dark:text-emerald-300">
                {formatCurrency(total)}
              </Text>
              <Text className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-200">IVA incluido.</Text>
            </View>
          </View>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-lg font-black text-slate-950 dark:text-white">Método de pago</Text>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = metodoDePago === method.value;

              return (
                <Pressable
                  key={method.value}
                  className={`rounded-full border px-4 py-3 active:opacity-75 ${
                    isSelected
                      ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  }`}
                  onPress={() => setMetodoDePago(method.value)}>
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
          {metodoDePago === "VIRTUAL_WALLET" && <View className="mt-4"><SearchSelect label="Billetera virtual" value={walletProvider} options={WALLET_PROVIDERS} onChange={(value) => setWalletProvider(value as WalletProvider)} /></View>}
        </View>

        <View className="gap-3 pb-2">
          <Pressable
            className={`items-center rounded-2xl p-4 active:opacity-80 ${isDisabled ? "bg-slate-300 dark:bg-slate-700" : "bg-[#111A1A] dark:bg-white"}`}
            onPress={handleAddSale}
            disabled={isDisabled}>
            <Text
              className={`text-base font-black ${isDisabled ? "text-slate-500 dark:text-slate-300" : "text-white dark:text-[#111A1A]"}`}>
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
