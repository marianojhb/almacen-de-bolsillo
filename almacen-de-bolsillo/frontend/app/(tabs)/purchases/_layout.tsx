// app/(tabs)/purchases/_layout.tsx

import { Stack } from "expo-router";
import { PurchaseDraftProvider } from "@/contexts/purchase-draft";
import { usePermissions } from "@/hooks/usePermissions";

export default function PurchasesLayout() {
  const { can } = usePermissions();
  return (
    <PurchaseDraftProvider>
      <Stack
        screenOptions={{
          headerBackButtonDisplayMode: "minimal",
          statusBarBackgroundColor: "#111A1A",
          headerStyle: { backgroundColor: "#111A1A" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "900" },
        }}>
        <Stack.Screen name="index" options={{ title: "Compras", headerShown: false }} />

        <Stack.Protected guard={can("purchases", "create")}>
        <Stack.Screen name="new/index" options={{ title: "Nueva compra" }} />
        <Stack.Screen name="new/select-suppliers" options={{ title: "Seleccionar proveedor" }} />
        <Stack.Screen name="new/review" options={{ title: "Revisar compra" }} />
        </Stack.Protected>

        <Stack.Screen
          name="[id]/index"
          options={{
            title: "Detalle de la compra",
          }}
        />
      </Stack>
    </PurchaseDraftProvider>
  );
}
