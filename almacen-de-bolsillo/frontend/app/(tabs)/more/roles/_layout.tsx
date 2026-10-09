import { BackButton } from "@/components/BackButton";
import { Stack } from "expo-router";
import { useAuth } from "@/contexts/auth";

export const unstable_settings = { initialRouteName: "index" };

export default function RolesLayout() {
  const { session } = useAuth();
  const canManage = session?.permissions.includes("roles.manage") ?? false;

  return (
    <Stack screenOptions={({ route }) => ({
      headerBackVisible: false,
      headerLeft: () => <BackButton fallback="/more" toParent={route.name === "index"} />,
      headerBackButtonDisplayMode: "minimal",
      headerStyle: { backgroundColor: "#111A1A" },
      headerTintColor: "#fff",
      headerTitleStyle: { fontWeight: "900" },
    })}>
      <Stack.Screen name="index" options={{ title: "Roles y permisos" }} />
      <Stack.Protected guard={canManage}>
        <Stack.Screen name="new" options={{ title: "Nuevo rol" }} />
      </Stack.Protected>
      <Stack.Protected guard={canManage}>
        <Stack.Screen name="[id]/edit" options={{ title: "Editar rol" }} />
      </Stack.Protected>
    </Stack>
  );
}
