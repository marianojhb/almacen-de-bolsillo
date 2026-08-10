// app/(tabs)/purchases/_layout.tsx

import { Stack } from "expo-router";
import { PurchaseDraftProvider } from "@/contexts/purchase-draft";

export default function PurchasesLayout() {
  return (
    <PurchaseDraftProvider>
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
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
  );
}
