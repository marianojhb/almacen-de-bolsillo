import { useMemo, useState } from "react";
import { FlatList, Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useSales } from "@/contexts/sales";

export default function SalesScreen() {
  const { totalSales, sales, isLoadingSales, errorSaleOrdersItems } = useSales();
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredSales = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    if (normalizedSearchText.length === 0) {
      return sales;
    }

    return sales.filter((sale) => {
      const formattedPaymentMethod =
        sale.paymentMethod === "EFECTIVO" ? "eft" : sale.paymentMethod === "MERCADOPAGO" ? "mp" : "ual";

      return [
        `venta ${sale.id}`,
        `#${sale.id}`,
        sale.invoice,
        sale.paymentMethod,
        formattedPaymentMethod,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearchText));
    });
  }, [sales, searchText]);

  if (isLoadingSales) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Cargando ventas...</Text>
          <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Estamos preparando tus órdenes de venta.
          </Text>
        </View>
      </View>
    );
  }

  if (errorSaleOrdersItems) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-red-100 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/30">
          <Text className="text-center text-xl font-bold text-red-700 dark:text-red-300">
            No pudimos cargar las ventas
          </Text>
          <Text className="mt-2 text-center text-sm text-red-600 dark:text-red-200">{errorSaleOrdersItems}</Text>
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
            <Text className="mt-1 text-4xl font-black text-white">Ventas</Text>
            <Text className="mt-2 text-sm leading-5 text-slate-300">
              {filteredSales.length} de {sales.length} ventas visibles · Total {" "}
              {Number(totalSales).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
            </Text>
          </View>

          <Pressable
            className="min-w-[124px] rounded-2xl bg-white/10 px-4 py-3 active:opacity-80"
            onPress={() => {
              Keyboard.dismiss();
              router.push("/sales/new");
            }}>
            <Text className="text-center text-sm font-black uppercase tracking-[1px] text-white">Nueva venta</Text>
          </Pressable>
        </View>
      </View>

      <View className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <View className="mb-2 flex-row items-center justify-between gap-3">
          <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
            Buscar
          </Text>
        </View>
        <TextInput
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          placeholder="Filtrar por número, factura o medio de pago"
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

      {sales.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-16">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">No hay ventas</Text>
            <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Registrá tu primera venta para empezar a seguir tus movimientos comerciales.
            </Text>
          </View>
        </View>
      ) : filteredSales.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-16">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">
              No encontramos resultados
            </Text>
            <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Probá con otro número de venta, factura o medio de pago.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredSales}
          keyExtractor={(sale) => sale.id.toString()}
          contentContainerClassName="gap-3 pb-8"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          renderItem={({ item: sale }) => {
            const paymentMethodLabel =
              sale.paymentMethod === "EFECTIVO"
                ? "Efectivo"
                : sale.paymentMethod === "MERCADOPAGO"
                  ? "Mercado Pago"
                  : "Ualá";

            const paymentMethodBadgeClass =
              sale.paymentMethod === "EFECTIVO"
                ? "bg-emerald-50 dark:bg-emerald-950/60"
                : sale.paymentMethod === "MERCADOPAGO"
                  ? "bg-amber-50 dark:bg-amber-950/60"
                  : "bg-blue-50 dark:bg-blue-950/60";

            const paymentMethodTextClass =
              sale.paymentMethod === "EFECTIVO"
                ? "text-emerald-700 dark:text-emerald-300"
                : sale.paymentMethod === "MERCADOPAGO"
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-blue-700 dark:text-blue-300";

            return (
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  router.push({
                    pathname: "/(tabs)/sales/[id]",
                    params: { id: String(sale.id) },
                  });
                }}
                className="rounded-3xl active:scale-[0.98] active:opacity-80">
                <View className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-2xl font-black text-slate-950 dark:text-white">Venta Nº{sale.id}</Text>
                      <Text className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400" numberOfLines={2}>
                        {sale.invoice ? `Factura ${sale.invoice}` : "Sin comprobante"}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-xs font-bold uppercase tracking-[1px] text-emerald-600 dark:text-emerald-400">
                        Total
                      </Text>
                      <Text className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                        {Number(sale.total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <View className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                      <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {new Date(sale.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    <View className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                      <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {new Date(sale.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </View>
                    <View className={`rounded-full px-3 py-1.5 ${paymentMethodBadgeClass}`}>
                      <Text className={`text-xs font-bold ${paymentMethodTextClass}`}>{paymentMethodLabel}</Text>
                    </View>
                    <View className={`rounded-full px-3 py-1.5 ${sale.isActive ? "bg-emerald-50 dark:bg-emerald-950/60" : "bg-slate-100 dark:bg-slate-900"}`}>
                      <Text
                        className={`text-xs font-bold ${
                          sale.isActive ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"
                        }`}>
                        {sale.isActive ? "Activa" : "Inactiva"}
                      </Text>
                    </View>
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
