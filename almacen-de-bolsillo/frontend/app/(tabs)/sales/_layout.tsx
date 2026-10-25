// app/(tabs)/sales/_layout.tsx

import { SalesDraftProvider } from "@/contexts/sales-draft/provider";
import { Stack } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";

export default function SalesLayout() {
  const { can } = usePermissions();
  return (
    <SalesDraftProvider>
      <Stack
        screenOptions={{
          headerBackButtonDisplayMode: "minimal",
          statusBarBackgroundColor: "#111A1A",
          headerStyle: { backgroundColor: "#111A1A" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "900" },
        }}>
        <Stack.Screen name="index" options={{ title: "Ventas", headerShown: false }} />

        <Stack.Protected guard={can("sales", "create")}>
        <Stack.Screen name="new/index" options={{ title: "Nueva venta" }} />

        <Stack.Screen
          name="new/select-products"
          options={{ title: "Seleccionar productos", presentation: "modal", headerShown: false }}
        />

        </Stack.Protected>
        <Stack.Screen name="[id]/index" options={{ title: "Detalle de la venta" }} />
      </Stack>
    </SalesDraftProvider>
  );
}
