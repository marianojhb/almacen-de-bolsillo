// app/(tabs)/purchases/_layout.tsx

import { Stack } from "expo-router";
import { PurchaseDraftProvider } from "@/contexts/purchase-draft";
import { usePermissions } from "@/hooks/usePermissions";
import { NotebookScene, useNotebookHeader } from "@/components/ui/notebook";

export default function PurchasesLayout() {
  const header = useNotebookHeader();
  const { can } = usePermissions();
  return (
    <PurchaseDraftProvider>
      <Stack
        screenLayout={({ children }) => <NotebookScene>{children}</NotebookScene>}
        screenOptions={{
          headerBackButtonDisplayMode: "minimal",
          ...header,
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
