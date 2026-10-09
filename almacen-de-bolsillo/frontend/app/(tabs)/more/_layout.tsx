import { Stack } from "expo-router";
import { useAuth } from "@/contexts/auth";
import { RolesProvider } from "@/contexts/roles";
import { UsersProvider } from "@/contexts/users";

export default function MoreLayout() {
  const { session } = useAuth();
  const canRead = (permission: string) => session?.permissions.includes(permission) ?? false;
  // Descartar los datos de gestión cuando cambia la cuenta o sus permisos.
  const managementKey = `${session?.user.id ?? "none"}:${session?.permissions.slice().sort().join("|") ?? ""}`;

  return (
    <RolesProvider key={managementKey}>
      <UsersProvider>
        <Stack screenOptions={{
          headerBackButtonDisplayMode: "minimal",
          statusBarBackgroundColor: "#111A1A",
          headerStyle: { backgroundColor: "#111A1A" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "900" },
          title: "Más",
        }}>
          <Stack.Screen name="index" options={{ title: "Más" }} />
          <Stack.Protected guard={canRead("suppliers.read")}>
            <Stack.Screen name="suppliers" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={canRead("transactions.read")}>
            <Stack.Screen name="transactions" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={canRead("employees.read")}>
            <Stack.Screen name="employees" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={canRead("users.read")}>
            <Stack.Screen name="users" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={canRead("roles.read")}>
            <Stack.Screen name="roles" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </UsersProvider>
    </RolesProvider>
  );
}
