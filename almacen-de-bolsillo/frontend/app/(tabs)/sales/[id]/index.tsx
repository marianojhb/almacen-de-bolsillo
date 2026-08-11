import { useSales } from "@/contexts/sales";
import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View, ScrollView, FlatList } from "react-native";
import { DeleteButton } from "@/components/sales/DeleteButton";

export default function SalesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sales } = useSales();

  const sale = sales.find((currentSale) => currentSale.id === Number(id));

  if (!sale) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Stack.Screen
          options={{
            title: "Ventas",
          }}
        />
        <Text className="text-base dark:text-white">Venta no encontrada</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#071111]">
      <Stack.Screen
        options={{
          title: "Ventas",
        }}
      />

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-8 pt-4">
        <View className="rounded-[28px] bg-[#111A1A] p-5 dark:bg-slate-950">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-300">Ventas</Text>
              <Text className="mt-1 text-4xl font-black text-white">Venta Nº{sale.id}</Text>
              <Text className="mt-2 text-sm leading-5 text-slate-300" numberOfLines={2}>
                Fecha: {new Date(sale.createdAt).toLocaleString("es-AR")}
              </Text>
              <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                Vendedor: {sale.seller.username}
              </Text>
            </View>

            <View>
              <Text className="mt-1 text-base font-semibold text-indigo-700 dark:text-indigo-300">{}</Text>
            </View>

            <View className="flex-column items-end gap-2">
              <View className={`rounded-full px-3 py-1.5 ${sale.isActive ? "bg-emerald-400" : "bg-slate-500"}`}>
                <Text className="text-xs font-black text-[#111A1A]">{sale.isActive ? "Activo" : "Inactivo"}</Text>
              </View>
              <View
                className={`rounded-full px-3 py-1.5 ${sale.paymentMethod === "EFECTIVO" ? "bg-emerald-400" : sale.paymentMethod === "MERCADOPAGO" ? "bg-amber-400" : "bg-blue-500"}`}>
                <Text className="text-xs font-black text-black">{sale.paymentMethod}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row gap-3">
          <DeleteButton id={id} />
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
            Total de la venta
          </Text>
          <Text className="mt-1 text-4xl font-black text-emerald-700 dark:text-emerald-300">
            {Number(sale.total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
          </Text>
        </View>

        <>
          <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <Text className="mb-4 text-lg font-black text-slate-950 dark:text-white">Detalles</Text>

            <View className="gap-4">
              <View>
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                  Total
                </Text>
                <Text className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">
                  {Number(sale.total - sale.iva).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                </Text>
              </View>

              <View>
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                  Descuento
                </Text>
                <Text className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">
                  {Number(sale.discount).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                </Text>
              </View>

              <View>
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                  Total sin IVA
                </Text>
                <Text className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">
                  {Number(sale.total / 1.21).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                </Text>
              </View>

              <View>
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                  IVA
                </Text>
                <Text className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">
                  {Number(sale.iva).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                </Text>
              </View>

              <View>
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                  Total con IVA
                </Text>
                <Text className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">
                  {Number(sale.total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                </Text>
              </View>
            </View>
          </View>
        </>

        <>
          <View className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <Text className="mb-4 text-lg font-black text-slate-950 dark:text-white">Artículos</Text>

            <View className="gap-4">
              {sale.salesOrderItems.map((item) => {
                return (
                  <View
                    key={item.productId}
                    className="flex-row items-center justify-between rounded-lg border border-gray-300 p-3 dark:border-gray-700">
                    <Text className="font-semibold dark:text-white">
                      {item.product?.shortname ?? "Producto no encontrado"}
                    </Text>
                    <Text className="dark:text-white">
                      {Number(item.quantity)} x{" "}
                      {Number(item.price).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                    </Text>
                    <Text className="dark:text-white">
                      {Number(item.price * item.quantity).toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })}{" "}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </>
      </ScrollView>
    </View>
  );
}
