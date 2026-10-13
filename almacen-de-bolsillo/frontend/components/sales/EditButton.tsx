import { router } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";
import { Pressable, Text } from "react-native";

export function EditButton({ id }: { id: string }) {
  const { can } = usePermissions();
  if (!can("sales", "update")) return null;

  return (
    <Pressable
      onPress={() => router.push(`/sales/${id}/edit`)}
      className="items-center rounded-2xl bg-[#111A1A] px-5 py-3 active:opacity-75 dark:bg-white">
      <Text className="text-sm font-black text-white dark:text-[#111A1A]">Editar</Text>
    </Pressable>
  );
}
