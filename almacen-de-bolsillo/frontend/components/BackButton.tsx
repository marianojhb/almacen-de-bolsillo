import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, Text } from "react-native";

type Props = { fallback: Href; toParent?: boolean };

export function BackButton({ fallback, toParent = false }: Props) {
  const router = useRouter();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Volver a la pantalla anterior"
      onPress={() => {
        if (!toParent && router.canGoBack()) router.back();
        else router.dismissTo(fallback);
      }}
      className="mr-3 min-h-11 flex-row items-center gap-1 pr-2 active:opacity-60">
      <Ionicons name="chevron-back" size={24} color="#ffffff" />
      <Text className="text-base font-semibold text-white">Volver</Text>
    </Pressable>
  );
}
