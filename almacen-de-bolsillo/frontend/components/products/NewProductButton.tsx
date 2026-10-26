import { router } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";
import { Pressable, Text } from "react-native";

export function NewProductButton() {
  const { can } = usePermissions();
  if (!can("products", "create")) return null;

  return (
    <Pressable
      onPress={() => router.push("/products/new")}
      accessibilityRole="button"
      accessibilityLabel="Agregar producto"
      className="min-h-12 shrink-0 justify-center rounded-xl bg-ink px-4 py-3 active:opacity-80">
      <Text className="text-center text-sm font-bold text-white">+ Agregar</Text>
    </Pressable>
  );
}
