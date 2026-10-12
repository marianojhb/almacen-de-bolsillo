import { Stack } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";

export default function SuppliersLayout() {
  const { can } = usePermissions();
  return (
      <Stack
        screenOptions={{
          headerBackButtonDisplayMode: "minimal",
          statusBarBackgroundColor: "#111A1A",
          headerStyle: { backgroundColor: "#111A1A" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "900" },
          
          
        }}>
        <Stack.Screen
          name="index"
          options={{
            title: "Proveedores",
            
          }}
        />

        <Stack.Protected guard={can("suppliers", "create")}>
        <Stack.Screen
          name="new"
          options={{
            title: "Nuevo proveedor",
          }}
        />

        </Stack.Protected>
        <Stack.Protected guard={can("suppliers", "update")}>
        <Stack.Screen
          name="[id]/edit"
          options={{
            title: "Editar proveedor",
          }}
        />
        <Stack.Screen name="[id]/products" options={{ title: "Productos del proveedor" }} />
        </Stack.Protected>
      </Stack>
  );
}
