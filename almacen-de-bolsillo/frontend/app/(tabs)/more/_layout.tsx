import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        statusBarBackgroundColor: "#111A1A",
        headerStyle: { backgroundColor: "#111A1A" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "900" },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Más",
        }}
      />
      
      {/* Suppliers screens */}
      <Stack.Screen
        name="suppliers/index"
        options={{
          title: "Proveedores",
        }}
      />

      <Stack.Screen
        name="suppliers/new"
        options={{
          title: "Nuevo proveedor",
        }}
      />

      <Stack.Screen
        name="suppliers/[id]/edit"
        options={{
          title: "Editar proveedor",
        }}
      />

      <Stack.Screen
        name="suppliers/[id]/products"
        options={{
          title: "Productos del proveedor",
        }}
      />

      {/* Other screens */}
    </Stack>
  );
}
