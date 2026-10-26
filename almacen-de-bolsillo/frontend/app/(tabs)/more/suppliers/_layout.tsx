import { Stack } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";
import { NotebookScene, useNotebookHeader } from "@/components/ui/notebook";

export default function SuppliersLayout() {
  const header = useNotebookHeader();
  const { can } = usePermissions();
  return (
      <Stack
        screenLayout={({ children }) => <NotebookScene>{children}</NotebookScene>}
        screenOptions={{
          headerBackButtonDisplayMode: "minimal",
          ...header,
          
          
        }}>
        <Stack.Screen
          name="index"
          options={{
            title: "Proveedores",
            
          }}
        />

        <Stack.Protected guard={can("suppliers", "create")}>
        <Stack.Screen
          name="new"
          options={{
            title: "Nuevo proveedor",
          }}
        />

        </Stack.Protected>
        <Stack.Protected guard={can("suppliers", "update")}>
        <Stack.Screen
          name="[id]/edit"
          options={{
            title: "Editar proveedor",
          }}
        />
        <Stack.Screen name="[id]/products" options={{ title: "Productos del proveedor" }} />
        </Stack.Protected>
        <Stack.Protected guard={can("purchases", "read")}>
          <Stack.Screen name="[id]/purchases" options={{ title: "Compras del proveedor" }} />
        </Stack.Protected>
      </Stack>
  );
}
