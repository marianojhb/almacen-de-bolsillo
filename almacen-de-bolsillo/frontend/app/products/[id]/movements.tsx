import { useLocalSearchParams } from "expo-router";
import { useProducts } from "@/contexts/useProducts";
import { View, Text, FlatList } from "react-native";
// import { movements } from "@/data/movements";
import { getStockMovements } from "@/services/movementsApi";
import { useState, useEffect } from "react";
import type { StockMovement } from "@/types/StockMovement";

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
    <View>
      <Text className="text-lg font-bold dark:text-white px-1 py-3 ">
        Movimientos de Producto: {product?.shortname ?? "Producto"}
      </Text>
      {isLoadingMovements && (
        <View className="flex-1 p-4">
          <Text className="text-[20px] dark:text-white">Cargando movimientos...</Text>
        </View>
      )}
      {movementsError && (
        <View className="flex-1 p-4">
          <Text className="text-[20px] dark:text-white">{movementsError}</Text>
        </View>
      )}
      {!isLoadingMovements && !movementsError && movements.length === 0 && (
        <View className="flex-1 p-4">
          <Text className="text-[20px] dark:text-white">Sin movimientos.</Text>
        </View>
      )}
      {!isLoadingMovements && !movementsError && movements.length > 0 && (
        <FlatList
          data={movements}
          keyExtractor={(movement) => movement.id.toString()}
          renderItem={({ item: movement }) => (
            <View className="flex-row justify-between p-1 border-b border-gray-300 py-2 dark:border-gray-700 items-center  ">
              <Text numberOfLines={1} className="w-24 shrink-0 text-sm dark:text-white">
                {new Date(movement.createdAt).toLocaleDateString()}
              </Text>
              <Text numberOfLines={1} className="w-12 shrink-0 text-center text-sm dark:text-white">
                {movement.quantity}
              </Text>
              <Text className="flex-1 min-w-0 px-2 text-sm dark:text-white">{movement.reason ?? "Sin motivo"}</Text>
              <View className="w-20 shrink-0 items-end">
                <Text
                  numberOfLines={1}
                  className={`h-8 rounded-lg border border-gray-300 px-2 py-2 text-center text-xs font-bold text-white dark:border-gray-700 ${
                    movement.type === "MANUAL_ENTRY"
                      ? "bg-green-500"
                      : movement.type === "MANUAL_EXIT"
                        ? "bg-red-500"
                        : movement.type === "ADJUSTMENT"
                          ? "bg-blue-600"
                          : "bg-gray-600"
                  }   w-20`}>
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
