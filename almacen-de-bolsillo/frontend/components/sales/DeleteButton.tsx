import { Alert, Pressable, Text } from "react-native";
import { useSales } from "@/contexts/sales";

export function DeleteButton({ id }: { id: string }) {
  const { deleteSale } = useSales();
  const handleDelete = () => {
    Alert.alert("Confirmar eliminación", "¿Estás seguro de que quieres eliminar este producto?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSale(Number(id));
            Alert.alert("Producto eliminado", "El producto ha sido eliminado correctamente.");
          } catch (error) {
            console.error("Error al eliminar la orden de venta:", error);
            Alert.alert("Error", "No se pudo eliminar la orden de venta.");
          }
        },
      },
    ]);
  };
  return (
    <Pressable onPress={handleDelete} className="items-center rounded-2xl bg-red-500 px-5 py-3 active:opacity-75">
      <Text className="text-sm font-black text-white">Eliminar</Text>
    </Pressable>
  );
}
