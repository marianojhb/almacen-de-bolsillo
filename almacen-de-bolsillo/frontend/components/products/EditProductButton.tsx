import { PermissionGate } from "@/components/auth/PermissionGate";
import { router } from "expo-router";
import { Pressable, Text } from "react-native";

export function EditProductButton({ id }: { id: string }) {
  return (
    <PermissionGate permission="products.update"><Pressable
      onPress={() => router.push(`/products/${id}/edit`)}
      className="items-center rounded-2xl bg-[#111A1A] px-5 py-3 active:opacity-75 dark:bg-white">
      <Text className="text-sm font-black text-white dark:text-[#111A1A]">Editar</Text>
    </Pressable></PermissionGate>
  );
}
