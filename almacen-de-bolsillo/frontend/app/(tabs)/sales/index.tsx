import { useCallback, useMemo, useState } from "react";
import { SectionList, Keyboard, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useSales } from "@/contexts/sales";
import { Permission } from "@/components/auth/Permission";
import { SellerInfo } from "@/components/sales/SellerInfo";
import { NotebookHeading } from "@/components/ui/notebook";
import { groupRecordsByDay } from "@/utils/notebook-sections";

export default function SalesScreen() {
  const { totalSales, sales, isLoadingSales, errorSaleOrders, refreshSales } = useSales();
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshSales();
    }, [refreshSales]),
  );

  const filteredSales = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    if (normalizedSearchText.length === 0) {
      return sales;
    }

    return sales.filter((sale) => {
      const formattedPaymentMethod =
        sale.paymentMethod === "EFECTIVO" ? "eft" : sale.paymentMethod === "MERCADOPAGO" ? "mp" : "ual";

      return [`venta ${sale.id}`, `#${sale.id}`, sale.invoice, sale.paymentMethod, formattedPaymentMethod]
        .filter((value): value is string => typeof value === "string")
        .some((value) => value.toLowerCase().includes(normalizedSearchText));
    });
  }, [sales, searchText]);
  const sections = useMemo(() => groupRecordsByDay(filteredSales), [filteredSales]);

  if (errorSaleOrders) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <View className="w-full rounded-3xl border border-red-100 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/30">
          <Text className="text-center text-xl font-bold text-red-700 dark:text-red-300">
            No pudimos cargar las ventas
          </Text>
          <Text className="mt-2 text-center text-sm text-red-600 dark:text-red-200">{errorSaleOrders}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-transparent px-6 pt-4"
      onStartShouldSetResponderCapture={() => {
        if (isSearchFocused) {
          Keyboard.dismiss();
        }

        return false;
      }}>
      <NotebookHeading subtitle={`${filteredSales.length} ventas · ${Number(totalSales).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}`}>
        Anotador de ventas
      </NotebookHeading>

      <View className="mb-5 flex-row flex-wrap items-center gap-2">
        <TextInput
          accessibilityLabel="Buscar venta por número, factura o medio de pago"
          className="min-h-12 min-w-[160px] flex-1 rounded-xl border border-slate-300 bg-white/60 px-3 py-3 text-base text-ink dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          placeholder="Buscar venta"
          placeholderTextColor="#94a3b8"
          keyboardType="default"
          returnKeyType="search"
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onSubmitEditing={Keyboard.dismiss}
        />
        <Permission resource="sales" action="create">
          <Pressable
            accessibilityRole="button"
            className="min-h-12 flex-row items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 active:opacity-80"
            onPress={() => { Keyboard.dismiss(); router.push("/sales/new"); }}>
            <Ionicons name="add" size={20} color="#FFFCF3" />
            <Text className="text-sm font-bold text-white">Nueva venta</Text>
          </Pressable>
        </Permission>
      </View>

      <SectionList
        sections={sections}
        stickySectionHeadersEnabled={false}
        keyExtractor={(sale) => sale.id.toString()}
        contentContainerClassName="pb-8"
        renderSectionHeader={({ section }) => (
          <View className="mb-1 mt-4 self-start border-b-2 border-pencil pb-1">
            <Text className="font-handwriting text-[28px] leading-9 text-ink dark:text-white">{section.title}</Text>
          </View>
        )}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoadingSales ? (
            <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
              <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">Cargando ventas...</Text>
                <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                  Estamos preparando tus órdenes de venta.
                </Text>
              </View>
            </View>
          ) : sales.length === 0 ? (
            <View className="flex-1 items-center justify-center pb-16">
              <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">No hay ventas</Text>
                <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                  Registrá tu primera venta para empezar a seguir tus movimientos comerciales.
                </Text>
              </View>
            </View>
          ) : (
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
          )
        }
        refreshControl={<RefreshControl refreshing={isLoadingSales} onRefresh={refreshSales} />}
        renderItem={({ item: sale }) => {
          const paymentMethodLabel =
            sale.paymentMethod === "EFECTIVO"
              ? "Efectivo"
              : sale.paymentMethod === "MERCADOPAGO"
                ? "Mercado Pago"
                : "Ualá";

          return (
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                router.push({
                  pathname: "/(tabs)/sales/[id]",
                  params: { id: String(sale.id) },
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Abrir venta ${sale.id}`}
              className="border-b border-slate-200 py-4 active:opacity-60 dark:border-slate-700">
              <View>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-ink dark:text-white">Venta Nº{sale.id}</Text>
                    <Text className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400" numberOfLines={2}>
                      {new Date(sale.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} · {paymentMethodLabel}
                      {sale.invoice ? ` · Factura ${sale.invoice}` : ""}
                    </Text>
                  </View>

                  <View className="max-w-[50%] flex-row items-center gap-2">
                    <Text selectable className="shrink text-lg font-bold text-ink dark:text-white">
                      {Number(sale.total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#637369" />
                  </View>
                </View>

                <SellerInfo seller={sale.seller} />
                {!sale.isActive ? <Text className="mt-2 text-xs font-bold text-red-700 dark:text-red-300">Inactiva</Text> : null}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
