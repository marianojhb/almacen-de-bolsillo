// app/(tabs)/products/_layout.tsx

import { usePermissions } from "@/hooks/usePermissions";
import { Stack } from "expo-router";
import { NotebookScene, useNotebookHeader } from "@/components/ui/notebook";

export const unstable_settings = {
  anchor: "index",
};

export default function ProductsLayout() {
  const header = useNotebookHeader();
  const { can } = usePermissions();
  return (
    <Stack
      screenLayout={({ children }) => <NotebookScene>{children}</NotebookScene>}
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        ...header,
      }}>
      <Stack.Screen name="index" options={{ title: "Productos", headerShown: false }} />

      <Stack.Protected guard={can("products", "create")}>
        <Stack.Screen name="new" options={{ title: "Nuevo producto" }} />
      </Stack.Protected>

      <Stack.Screen name="[id]/index" options={{ title: "Detalle del producto" }} />

      <Stack.Protected guard={can("products", "update")}>
      <Stack.Screen name="[id]/edit" options={{ title: "Editar producto" }} />

      <Stack.Screen name="[id]/stock-adjustment" options={{ title: "Ajustar stock" }} />
      </Stack.Protected>

      <Stack.Screen name="[id]/movements" options={{ title: "Historial de stock" }} />
    </Stack>
  );
}
