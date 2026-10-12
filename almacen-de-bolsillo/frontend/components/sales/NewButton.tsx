import { router } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";
import { Pressable, Text } from "react-native";

export function NewButton() {
  const { can } = usePermissions();
  if (!can("sales", "create")) return null;

  return (
    <Pressable
      onPress={() => router.push("/sales/new")}
      className="items-center rounded-xl bg-[#111A1A] px-4 py-2 active:opacity-75">
      <Text className="text-base font-semibold text-white">Agregar</Text>
    </Pressable>
  );
}
