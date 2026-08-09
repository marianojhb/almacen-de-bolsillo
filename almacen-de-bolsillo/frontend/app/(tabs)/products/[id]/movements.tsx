import { useLocalSearchParams } from "expo-router";
import { useProducts } from "@/contexts/products";
import { View, Text, FlatList } from "react-native";
import { getStockMovements } from "@/services/movementsApi";
import { useState, useEffect } from "react";
import type { StockMovement } from "@almacen/shared";

export default function StockMovementsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useProducts();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  // State to track loading and error states
  const [movementsError, setMovementsError] = useState<string | null>(null);
  const [isLoadingMovements, setIsLoadingMovements] = useState(true);

  const product = products.find((product) => product.id === Number(id));

  useEffect(() => {
    const productId = Number(id);
    if (Number.isNaN(productId)) {
      setMovementsError("Producto inválido");
      setIsLoadingMovements(false);
      return;
    }
    const fetchMovements = async (productId: number) => {
      try {
        setIsLoadingMovements(true);
        setMovementsError(null);
        const movements = await getStockMovements(productId);
        setMovements(movements);
      } catch (error) {
        console.error("Error fetching stock movements:", error);
        setMovementsError("Error fetching stock movements");
      } finally {
        setIsLoadingMovements(false);
      }
    };

    fetchMovements(productId);

    // Actualizar el estado y el fetch con los productos obtenidos desde la API
  }, [id]);

  return (
    <View className="flex-1 bg-slate-50 px-4 pt-4 dark:bg-[#071111]">
      <View className="mb-4 rounded-[28px] bg-[#111A1A] p-5 dark:bg-slate-950">
        <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-300">Historial</Text>
        <Text className="mt-1 text-3xl font-black text-white">Movimientos</Text>
        <Text className="mt-2 text-sm leading-5 text-slate-300">
          {product?.shortname ?? "Producto"} · {movements.length} registros
        </Text>
      </View>
      {isLoadingMovements && (
        <View className="flex-1 items-center justify-center pb-16">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">
              Cargando movimientos...
            </Text>
            <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Consultando el historial de stock.
            </Text>
          </View>
        </View>
      )}
      {movementsError && (
        <View className="flex-1 items-center justify-center pb-16">
          <View className="w-full rounded-3xl border border-red-100 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/30">
            <Text className="text-center text-xl font-bold text-red-700 dark:text-red-300">
              No pudimos cargar movimientos
            </Text>
            <Text className="mt-2 text-center text-sm text-red-600 dark:text-red-200">{movementsError}</Text>
          </View>
        </View>
      )}
      {!isLoadingMovements && !movementsError && movements.length === 0 && (
        <View className="flex-1 items-center justify-center pb-16">
          <View className="w-full rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <Text className="text-center text-2xl font-black text-slate-950 dark:text-white">Sin movimientos</Text>
            <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Todavía no se registraron cambios de stock para este producto.
            </Text>
          </View>
        </View>
      )}
      {!isLoadingMovements && !movementsError && movements.length > 0 && (
        <FlatList
          data={movements}
          keyExtractor={(movement) => movement.id.toString()}
          contentContainerClassName="gap-3 pb-8"
          showsVerticalScrollIndicator={false}
          renderItem={({ item: movement }) => (
            <View className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                    {new Date(movement.createdAt).toLocaleDateString("es-AR")}
                  </Text>
                  <Text className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                    {movement.reason ?? "Sin motivo"}
                  </Text>
                  <Text className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Cantidad: {movement.quantity}
                  </Text>
                </View>
                <Text
                  numberOfLines={1}
                  className={`rounded-full px-3 py-1.5 text-center text-xs font-black text-white ${
                    movement.type === "MANUAL_ENTRY"
                      ? "bg-emerald-500"
                      : movement.type === "MANUAL_EXIT"
                        ? "bg-red-500"
                        : movement.type === "ADJUSTMENT"
                          ? "bg-blue-600"
                          : "bg-gray-600"
                  }`}>
                  {movement.type === "MANUAL_ENTRY"
                    ? "ENTRADA"
                    : movement.type === "MANUAL_EXIT"
                      ? "SALIDA"
                      : movement.type === "ADJUSTMENT"
                        ? "AJUSTE"
                        : movement.type === "PURCHASE"
                          ? "COMPRA"
                          : movement.type === "SALE"
                            ? "VENTA"
                            : "OTRO"}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
