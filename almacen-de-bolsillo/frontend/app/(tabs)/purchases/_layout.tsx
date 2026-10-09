import { BackButton } from "@/components/BackButton";
import { usePermissions } from "@/hooks/use-permissions";
// app/(tabs)/purchases/_layout.tsx

import { Stack } from "expo-router";
import { PurchaseDraftProvider } from "@/contexts/purchase-draft";

export const unstable_settings = { initialRouteName: "index" };

export default function PurchasesLayout() {
  const { can } = usePermissions();
  return (
    <PurchaseDraftProvider>
      <Stack
        screenOptions={({ route }) => ({
          headerBackVisible: false,
          headerLeft: () => route.name !== "index" ? <BackButton fallback="/purchases" /> : null,
          headerBackButtonDisplayMode: "minimal",
          statusBarBackgroundColor: "#111A1A",
          headerStyle: { backgroundColor: "#111A1A" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "900" },
        })}>
        <Stack.Screen name="index" options={{ title: "Compras" }} />

        <Stack.Protected guard={can("purchases.create")}>
          <Stack.Screen name="new/index" options={{ title: "Nueva compra" }} />
        </Stack.Protected>
        <Stack.Protected guard={can("purchases.create")}>
          <Stack.Screen name="new/select-suppliers" options={{ title: "Seleccionar proveedor" }} />
        </Stack.Protected>
        <Stack.Protected guard={can("purchases.create")}>
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
