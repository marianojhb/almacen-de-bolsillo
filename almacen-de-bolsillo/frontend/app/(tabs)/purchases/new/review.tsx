import type { CreatePurchaseOrderDto } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { usePurchaseDraft } from "@/contexts/purchase-draft";
import { usePurchases } from "@/contexts/purchases";
import { useSuppliers } from "@/contexts/suppliers";

type SupplierReviewItem = {
  productId: number;
  shortname: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
};

type SupplierReviewGroup = {
  supplierId: number;
  supplierName: string;
  items: SupplierReviewItem[];
  total: number;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  });

export default function ReviewPurchaseScreen() {
  const { items, purchaseQuantities, clearPurchase } = usePurchaseDraft();
  const { suppliers } = useSuppliers();
  const { addPurchase, refreshPurchases } = usePurchases();
  const [isCreatingOrders, setIsCreatingOrders] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  const supplierGroups = useMemo<SupplierReviewGroup[]>(() => {
    const groups = new Map<number, SupplierReviewGroup>();

    items.forEach((draftItem) => {
      suppliers.forEach((supplier) => {
        const quantity = purchaseQuantities[`${draftItem.productId}-${supplier.id}`] ?? 0;

        if (quantity <= 0) {
          return;
        }

        const supplierProduct = supplier.products.find((product) => product.productId === draftItem.productId);

        if (!supplierProduct) {
          return;
        }

        const price = Number(supplierProduct.price ?? 0);
        const discount = Number(draftItem.discount ?? 0);
        const subtotal = price * quantity;
        const reviewItem: SupplierReviewItem = {
          productId: draftItem.productId,
          shortname: draftItem.shortname ?? "Producto sin nombre",
          quantity,
          price,
          discount,
          subtotal,
        };
        const currentGroup = groups.get(supplier.id);

        if (currentGroup) {
          currentGroup.items.push(reviewItem);
          currentGroup.total += subtotal;
          return;
        }

        groups.set(supplier.id, {
          supplierId: supplier.id,
          supplierName: supplier.name,
          items: [reviewItem],
          total: subtotal,
        });
      });
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        items: group.items.sort((firstItem, secondItem) =>
          firstItem.shortname.localeCompare(secondItem.shortname, "es"),
        ),
      }))
      .sort((firstGroup, secondGroup) => firstGroup.supplierName.localeCompare(secondGroup.supplierName, "es"));
  }, [items, purchaseQuantities, suppliers]);

  const grandTotal = supplierGroups.reduce((total, group) => total + group.total, 0);
  const totalUnits = supplierGroups.reduce(
    (total, group) => total + group.items.reduce((groupTotal, item) => groupTotal + item.quantity, 0),
    0,
  );
  const isCreateDisabled = supplierGroups.length === 0 || isCreatingOrders;

  const handleCreateOrders = async () => {
    if (isCreateDisabled) {
      return;
    }

    const orders: CreatePurchaseOrderDto[] = supplierGroups.map((group) => ({
      supplierId: group.supplierId,
      userId: 3,
      total: group.total,
      items: group.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      })),
    }));

    setIsCreatingOrders(true);
    setCreationError(null);

    try {
      const results = await Promise.all(orders.map((order) => addPurchase(order)));

      if (results.some((wasCreated) => !wasCreated)) {
        setCreationError("No se pudieron generar todas las órdenes. Volvé a intentarlo.");
        return;
      }

      clearPurchase();
      await refreshPurchases();
      router.dismissTo("/(tabs)/purchases");
    } catch {
      setCreationError("Ocurrió un error al generar las órdenes de compra.");
    } finally {
      setIsCreatingOrders(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#071111]">
      <View className="mx-4 mt-4 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver a proveedores y cantidades"
            className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 active:opacity-70 dark:bg-slate-900"
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={21} color="#64748b" />
          </Pressable>

          <View className="flex-1">
            <Text className="text-xs font-black uppercase tracking-[1.4px] text-emerald-700 dark:text-emerald-400">
              Paso 3 de 3
            </Text>
            <Text className="mt-1 text-xl font-black text-slate-950 dark:text-white">Revisar compra</Text>
            <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Confirmá los productos, cantidades y totales.
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="mt-4 flex-1" contentContainerClassName="gap-3 px-4 pb-4">
        {supplierGroups.length === 0 ? (
          <View className="mt-4 items-center rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 dark:border-slate-700 dark:bg-slate-950">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
              <Ionicons name="receipt-outline" size={27} color="#64748b" />
            </View>
            <Text className="mt-4 text-center text-lg font-black text-slate-950 dark:text-white">
              No hay cantidades cargadas
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-slate-500 dark:text-slate-400">
              Volvé al paso anterior y asigná al menos una cantidad a un proveedor.
            </Text>
          </View>
        ) : (
          supplierGroups.map((group) => (
            <View
              key={group.supplierId}
              className="overflow-hidden rounded-[24px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <View className="flex-row items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
                  <Ionicons name="storefront-outline" size={22} color="#047857" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-black text-slate-950 dark:text-white">{group.supplierName}</Text>
                  <Text className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {group.items.length} {group.items.length === 1 ? "producto" : "productos"}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[10px] font-black uppercase tracking-[1px] text-slate-400 dark:text-slate-500">
                    Total
                  </Text>
                  <Text className="mt-0.5 text-base font-black text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(group.total)}
                  </Text>
                </View>
              </View>

              <View className="gap-3 p-4">
                {group.items.map((item, itemIndex) => (
                  <View
                    key={item.productId}
                    className={
                      itemIndex === 0 ? "flex-row items-center gap-3" : "flex-row items-center gap-3 border-t border-slate-100 pt-3 dark:border-slate-800"
                    }>
                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900">
                      <Ionicons name="cube-outline" size={18} color="#64748b" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-black text-slate-900 dark:text-white">{item.shortname}</Text>
                      <Text className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {item.quantity} × {formatCurrency(item.price)}
                      </Text>
                    </View>
                    <Text className="text-sm font-black text-slate-950 dark:text-white">
                      {formatCurrency(item.subtotal)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        <View className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/60">
              <Ionicons name="documents-outline" size={20} color="#047857" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-black text-emerald-900 dark:text-emerald-100">
                {supplierGroups.length === 1
                  ? "Se generará 1 orden, una por cada proveedor."
                  : `Se generarán ${supplierGroups.length} órdenes, una por cada proveedor.`}
              </Text>
              {supplierGroups.length > 0 && (
                <Text className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {totalUnits} {totalUnits === 1 ? "unidad" : "unidades"} · Total general {formatCurrency(grandTotal)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 dark:border-slate-800 dark:bg-slate-950">
        {creationError && (
          <View className="mb-3 flex-row items-center gap-2 rounded-2xl bg-red-50 px-3 py-3 dark:bg-red-950/30">
            <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />
            <Text className="flex-1 text-sm font-bold text-red-600 dark:text-red-300">{creationError}</Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Generar órdenes de compra"
          accessibilityState={{ disabled: isCreateDisabled }}
          disabled={isCreateDisabled}
          className={`flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4 active:opacity-80 ${
            isCreateDisabled ? "bg-slate-200 dark:bg-slate-800" : "bg-emerald-700 dark:bg-emerald-600"
          }`}
          onPress={handleCreateOrders}>
          {isCreatingOrders ? (
            <ActivityIndicator color="#94a3b8" />
          ) : (
            <Ionicons name="checkmark-circle-outline" size={20} color={isCreateDisabled ? "#94a3b8" : "white"} />
          )}
          <Text
            className={`text-base font-black ${
              isCreateDisabled ? "text-slate-400 dark:text-slate-500" : "text-white"
            }`}>
            {isCreatingOrders ? "Generando órdenes..." : "Generar órdenes de compra"}
          </Text>
        </Pressable>
        <Text className="mt-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
          Los precios se guardarán al crear la orden
        </Text>
      </View>
    </View>
  );
}
