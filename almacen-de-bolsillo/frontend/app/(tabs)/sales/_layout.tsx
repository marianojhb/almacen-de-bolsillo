import { BackButton } from "@/components/BackButton";
import { usePermissions } from "@/hooks/use-permissions";
// app/(tabs)/sales/_layout.tsx

import { SalesDraftProvider } from "@/contexts/sales-draft/provider";
import { Stack } from "expo-router";

export const unstable_settings = { initialRouteName: "index" };

export default function SalesLayout() {
  const { can } = usePermissions();
  return (
    <SalesDraftProvider>
      <Stack
        screenOptions={({ route }) => ({
          headerBackVisible: false,
          headerLeft: () => route.name !== "index" ? <BackButton fallback="/sales" /> : null,
          headerBackButtonDisplayMode: "minimal",
          statusBarBackgroundColor: "#111A1A",
          headerStyle: { backgroundColor: "#111A1A" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "900" },
        })}>
        <Stack.Screen name="index" options={{ title: "Ventas" }} />

        <Stack.Protected guard={can("sales.create")}>
          <Stack.Screen name="new/index" options={{ title: "Nueva venta" }} />
        </Stack.Protected>

        <Stack.Protected guard={can("sales.create")}>
          <Stack.Screen
            name="new/select-products"
            options={{ title: "Seleccionar productos", presentation: "modal", headerShown: true }}
          />
        </Stack.Protected>

        <Stack.Screen name="[id]/index" options={{ title: "Detalle de la venta" }} />
      </Stack>
    </SalesDraftProvider>
  );
}
