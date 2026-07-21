import { router } from "expo-router";
import { Alert, Pressable, Text } from "react-native";

export default function DeleteProductButton({ id }: { id: string }) {
  return (
    <Pressable
      onPress={() => {
        Alert.alert("Confirmar eliminación", "¿Estás seguro de que quieres eliminar este producto?", [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => router.push(`/products/delete/${id}`),
          },
        ]);
      }}
      className="items-center w-24 rounded-xl bg-red-500 px-4 py-2 active:opacity-75">
      <Text className="text-base font-semibold text-white">Eliminar</Text>
    </Pressable>
  );
}
