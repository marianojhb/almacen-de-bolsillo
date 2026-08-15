// app/(tabs)/purchases/_layout.tsx

import { Stack } from "expo-router";
import { PurchaseDraftProvider } from "@/contexts/purchase-draft";

export default function PurchasesLayout() {
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
        <Stack.Screen name="index" options={{ title: "Compras" }} />

        <Stack.Screen name="new/index" options={{ title: "Nueva compra" }} />
        <Stack.Screen name="new/select-suppliers" options={{ title: "Seleccionar proveedor" }} />
        <Stack.Screen name="new/review" options={{ title: "Revisar compra" }} />

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
