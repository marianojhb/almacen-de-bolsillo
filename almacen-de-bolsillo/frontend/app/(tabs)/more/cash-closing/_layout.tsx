import { Stack } from "expo-router";

export default function CashClosingLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        statusBarBackgroundColor: "#111A1A",
        headerStyle: { backgroundColor: "#111A1A" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "900" },
      }}>
      <Stack.Screen name="index" options={{ title: "Cierre de Caja" }} />
    </Stack>
  );
}
