import { BackButton } from "@/components/BackButton";
import { usePermissions } from "@/hooks/use-permissions";
import { Stack } from "expo-router";

export const unstable_settings = { initialRouteName: "index" };

export default function SuppliersLayout() {
  const { can } = usePermissions();
  return (
      <Stack
        screenOptions={({ route }) => ({
          headerBackVisible: false,
          headerLeft: () => <BackButton fallback="/more" toParent={route.name === "index"} />,
          headerBackButtonDisplayMode: "minimal",
          statusBarBackgroundColor: "#111A1A",
          headerStyle: { backgroundColor: "#111A1A" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "900" },
        })}>
        <Stack.Screen
          name="index"
          options={{
            title: "Proveedores",
            
          }}
        />

        <Stack.Protected guard={can("suppliers.create")}>
          <Stack.Screen
            name="new"
            options={{
              title: "Nuevo proveedor",
            }}
          />
        </Stack.Protected>

        <Stack.Protected guard={can("suppliers.update")}>
          <Stack.Screen
            name="[id]/edit"
            options={{
              title: "Editar proveedor",
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={can("products.read")}>
          <Stack.Screen name="[id]/products" options={{ title: "Productos del proveedor" }} />
        </Stack.Protected>
      </Stack>
  );
}
