import { router } from "expo-router";
import { Pressable, Text } from "react-native";

export function NewProductButton() {
  return (
    <Pressable
      onPress={() => router.push("/products/new")}
      className="min-w-[132px] rounded-2xl bg-white/10 px-4 py-3 active:opacity-80">
      <Text className="text-center text-sm font-black uppercase tracking-[1px] text-white">Agregar</Text>
    </Pressable>
  );
}
