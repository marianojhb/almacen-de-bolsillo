import { PermissionGate } from "@/components/auth/PermissionGate";
import { router } from "expo-router";
import { Pressable, Text } from "react-native";

export function NewButton() {
  return (
    <PermissionGate permission="sales.create"><Pressable
      onPress={() => router.push("/sales/new")}
      className="items-center rounded-xl bg-[#111A1A] px-4 py-2 active:opacity-75">
      <Text className="text-base font-semibold text-white">Agregar</Text>
    </Pressable></PermissionGate>
  );
}
