import { Stack } from "expo-router";

export default function SuppliersLayout() {
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
            title: "Proveedores",
            
          }}
        />

        <Stack.Screen
          name="new"
          options={{
            title: "Nuevo proveedor",
          }}
        />

        <Stack.Screen
          name="[id]/edit"
          options={{
            title: "Editar proveedor",
          }}
        />
      </Stack>
  );
}
