import { router } from "expo-router";
import { Pressable, Text } from "react-native";

export default function EditProductButton({ id }: { id: string }) {
  return (
    <Pressable
      onPress={() => router.push(`/products/${id}/edit`)}
      className="items-center w-24 rounded-lg bg-[#111A1A] px-2 py-2 active:opacity-75">
      <Text className="text-base font-semibold text-white">Editar</Text>
    </Pressable>
  );
}
