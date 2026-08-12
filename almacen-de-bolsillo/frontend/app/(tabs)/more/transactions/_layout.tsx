import { Stack } from "expo-router";
import { TransactionsProvider } from "@/contexts/transactions";

export default function SuppliersLayout() {
  return (
    <TransactionsProvider>
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
            title: "Movimientos",
          }}
        />
      </Stack>
    </TransactionsProvider>
  );
}
