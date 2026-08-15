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
        title: "Más",
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Más",
        }}
      />

      <Stack.Screen 
        name="suppliers" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="transactions" 
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
