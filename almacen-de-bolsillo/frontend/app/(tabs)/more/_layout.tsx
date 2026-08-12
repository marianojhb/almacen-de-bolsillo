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

      <Stack.Screen
        name="suppliers/index"
        options={{
          title: "Proveedores",
        }}
      />
    </Stack>
  );
}
