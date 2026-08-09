// app/(tabs)/products/_layout.tsx

import { Stack } from "expo-router";

export default function ProductsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerStyle: { backgroundColor: "#111A1A" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "900" },
      }}>
      <Stack.Screen name="index" options={{ title: "Productos" }} />

      <Stack.Screen name="new" options={{ title: "Nuevo producto" }} />

      <Stack.Screen name="[id]/index" options={{ title: "Detalle del producto" }} />

      <Stack.Screen name="[id]/edit" options={{ title: "Editar producto" }} />

      <Stack.Screen name="[id]/stock-adjustment" options={{ title: "Ajustar stock" }} />

      <Stack.Screen name="[id]/movements" options={{ title: "Historial de stock" }} />
    </Stack>
  );
}
