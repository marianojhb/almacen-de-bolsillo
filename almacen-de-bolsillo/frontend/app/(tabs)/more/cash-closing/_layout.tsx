import { Ionicons } from "@expo/vector-icons";
import { router, Stack, type Href } from "expo-router";
import { Pressable, Text } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { NotebookScene, useNotebookHeader } from "@/components/ui/notebook";

export default function CashClosingLayout() {
  const header = useNotebookHeader();
  const { user } = useAuth();
  const isOwner = user?.role === "BUSINESS_OWNER";
  return (
    <Stack
      screenLayout={({ children }) => <NotebookScene>{children}</NotebookScene>}
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        ...header,
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Caja",
          headerRight: () => isOwner ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver historial de cierres"
              className="min-h-11 flex-row items-center gap-2 px-2 active:opacity-70"
              onPress={() => router.push("/more/cash-closing/history" as Href)}>
              <Ionicons name="time-outline" size={20} color={header.headerTintColor} />
              <Text className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Historial</Text>
            </Pressable>
          ) : null,
        }}
      />
      <Stack.Protected guard={isOwner}>
        <Stack.Screen name="history" options={{ title: "Historial de cierres" }} />
      </Stack.Protected>
    </Stack>
  );
}
