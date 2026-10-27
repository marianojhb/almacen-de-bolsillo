import { Ionicons } from "@expo/vector-icons";
import { router, Stack, type Href } from "expo-router";
import { Pressable, Text } from "react-native";
import { usePermissions } from "@/hooks/usePermissions";
import { NotebookScene, useNotebookHeader } from "@/components/ui/notebook";
import { useAuth } from "@/contexts/AuthContext";

export const unstable_settings = {
  anchor: "index",
};

export default function MoreLayout() {
  const header = useNotebookHeader();
  const { can, hasFullAccess } = usePermissions();
  const { user } = useAuth();
  const isOwner = user?.role === "BUSINESS_OWNER";
  return (
    <Stack
      screenLayout={({ children }) => <NotebookScene>{children}</NotebookScene>}
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        ...header,
        title: "Más",
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Más",
          headerShown: false,
        }}
      />

      <Stack.Protected guard={can("suppliers", "read")}>
      <Stack.Screen 
        name="suppliers" 
        options={{ headerShown: false }} 
      />
      </Stack.Protected>
      <Stack.Protected guard={hasFullAccess}>
      <Stack.Screen 
        name="transactions" 
        options={{ headerShown: false }}
      />
      </Stack.Protected>
      <Stack.Protected guard={can("employees", "read")}>
      <Stack.Screen
        name="employees"
        options={{ headerShown: false }}
      />
      </Stack.Protected>
      <Stack.Protected guard={can("workShifts", "read")}>
      <Stack.Screen
        name="work-shifts"
         options={{ headerShown: false }}
      />
      </Stack.Protected>
      <Stack.Screen
        name="cash-closing/index"
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
        <Stack.Screen name="cash-closing/history" options={{ title: "Historial de cierres" }} />
        <Stack.Screen name="profitability" options={{ title: "Rentabilidad" }} />
      </Stack.Protected>
      <Stack.Screen
        name="account"
        options={{ title: "Mi cuenta" }}
      />
    </Stack>
  );
}
