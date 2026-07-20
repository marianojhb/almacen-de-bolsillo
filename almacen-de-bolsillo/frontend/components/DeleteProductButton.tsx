import { router } from "expo-router";
import { Pressable, Text } from "react-native";

export default function DeleteProductButton({ id }: { id: string }) {
  return (
    <Pressable
      onPress={() => router.push(`/products/delete/${id}`)}
      className="items-center rounded-xl bg-[#111A1A] px-4 py-2 active:opacity-75">
      <Text className="text-base font-semibold text-red-500">Eliminar</Text>
    </Pressable>
  );
}
