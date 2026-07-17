import { router } from "expo-router";
import { Pressable, Text } from "react-native";

export default function NewProductButton() {
  return (
    <Pressable
      onPress={() => router.push("/products/new")}
      className="items-center rounded-xl bg-[#111A1A] px-4 py-2 active:opacity-75"
    >
      <Text className="text-base font-semibold text-white">
        +
      </Text>
    </Pressable>
  );
}