// app/(tabs)/sales/_layout.tsx

import { Stack } from "expo-router";

export default function SalesLayout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen name="index" options={{ title: "Ventas" }} />

      <Stack.Screen name="new/index" options={{ title: "Nueva venta" }} />

      <Stack.Screen name="new/select-products" options={{ title: "Seleccionar productos", presentation: "modal", headerShown: false }} />
      
      <Stack.Screen name="[id]/index" options={{ title: "Detalle de la venta" }} />

      <Stack.Screen name="[id]/edit" options={{ title: "Editar venta" }} />
    </Stack>
  );
}
