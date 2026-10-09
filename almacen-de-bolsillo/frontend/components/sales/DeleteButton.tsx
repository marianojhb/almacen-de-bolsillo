import { PermissionGate } from "@/components/auth/PermissionGate";
import { router } from "expo-router";
import { Alert, Pressable, Text } from "react-native";
import { useSales } from "@/contexts/sales";

export function DeleteButton({ id }: { id: string }) {
  const { deleteSale } = useSales();
  const handleDelete = () => {
    Alert.alert("Confirmar eliminación", "¿Querés eliminar definitivamente esta venta? Esta acción no es una baja lógica.", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const deleted = await deleteSale(Number(id));
            if (!deleted) throw new Error("No se pudo eliminar la venta.");
            Alert.alert("Venta eliminada", "La venta fue eliminada correctamente.");
            router.replace("/(tabs)/sales");
          } catch (error) {
            console.error("Error al eliminar la orden de venta:", error);
            Alert.alert("Error", "No se pudo eliminar la orden de venta.");
          }
        },
      },
    ]);
  };
  return (
    <PermissionGate permission="sales.delete"><Pressable onPress={handleDelete} className="items-center rounded-2xl bg-red-500 px-5 py-3 active:opacity-75">
      <Text className="text-sm font-black text-white">Eliminar</Text>
    </Pressable></PermissionGate>
  );
}
