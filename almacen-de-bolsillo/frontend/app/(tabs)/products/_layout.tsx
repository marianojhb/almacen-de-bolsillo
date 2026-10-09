import { BackButton } from "@/components/BackButton";
import { usePermissions } from "@/hooks/use-permissions";
// app/(tabs)/products/_layout.tsx


import { Stack } from "expo-router";

export const unstable_settings = { initialRouteName: "index" };

export default function ProductsLayout() {
  const { can } = usePermissions();
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerBackVisible: false,
        headerLeft: () => route.name !== "index" ? <BackButton fallback="/products" /> : null,
        headerBackButtonDisplayMode: "minimal",
        statusBarBackgroundColor: "#111A1A",
        headerStyle: { backgroundColor: "#111A1A" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "900" },
      })}>
      <Stack.Screen name="index" options={{ title: "Productos" }} />

      <Stack.Protected guard={can("products.create")}>
        <Stack.Screen name="new" options={{ title: "Nuevo producto" }} />
      </Stack.Protected>

      <Stack.Screen name="[id]/index" options={{ title: "Detalle del producto" }} />

      <Stack.Protected guard={can("products.update")}>
        <Stack.Screen name="[id]/edit" options={{ title: "Editar producto" }} />
      </Stack.Protected>

      <Stack.Protected guard={can("stock_movements.create")}>
        <Stack.Screen name="[id]/stock-adjustment" options={{ title: "Ajustar stock" }} />
      </Stack.Protected>

      <Stack.Protected guard={can("stock_movements.read")}>
        <Stack.Screen name="[id]/movements" options={{ title: "Historial de stock" }} />
      </Stack.Protected>
    </Stack>
  );
}
