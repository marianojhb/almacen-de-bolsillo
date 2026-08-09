import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode:
          "minimal",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Más",
        }}
      />

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
    </Stack>
  );
}