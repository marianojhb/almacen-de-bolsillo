import { Stack } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";

export default function MoreLayout() {
  const { can, hasFullAccess } = usePermissions();
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        statusBarBackgroundColor: "#111A1A",
        headerStyle: { backgroundColor: "#111A1A" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "900" },
        title: "Más",
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Más",
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
    </Stack>
  );
}
