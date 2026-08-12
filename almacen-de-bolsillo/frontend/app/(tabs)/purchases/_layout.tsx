// app/(tabs)/purchases/_layout.tsx

import { Stack } from "expo-router";
import { PurchaseDraftProvider } from "@/contexts/purchase-draft";
import { PurchasesProvider } from "@/contexts/purchases";

export default function PurchasesLayout() {
  return (
    <PurchasesProvider>
      <PurchaseDraftProvider>
        <Stack
          screenOptions={{
            headerBackButtonDisplayMode: "minimal",
            statusBarBackgroundColor: "#111A1A",
            headerStyle: { backgroundColor: "#111A1A" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "900" },
          }}>
          <Stack.Screen name="index" options={{ title: "Compras" }} />

          <Stack.Screen name="/(tabs)/purchases/new" options={{ title: "Nueva compra" }} />

          <Stack.Screen
            name="new/select-products"
            options={{ title: "Seleccionar productos", presentation: "modal", headerShown: false }}
          />

          <Stack.Screen
            name="(tabs)/purchases/[id]/index"
            options={{
              title: "Detalle de la compra",
            }}
          />
        </Stack>
      </PurchaseDraftProvider>
    </PurchasesProvider>
  );
}
