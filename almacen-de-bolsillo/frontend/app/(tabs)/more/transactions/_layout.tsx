import { BackButton } from "@/components/BackButton";
import { Stack } from "expo-router";
import { TransactionsProvider } from "@/contexts/transactions";

export const unstable_settings = { initialRouteName: "index" };

export default function SuppliersLayout() {
  return (
    <TransactionsProvider>
      <Stack
        screenOptions={({ route }) => ({
          headerBackVisible: false,
          headerLeft: () => <BackButton fallback="/more" toParent={route.name === "index"} />,
          headerBackButtonDisplayMode: "minimal",
          statusBarBackgroundColor: "#111A1A",
          headerStyle: { backgroundColor: "#111A1A" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "900" },
        })}>
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
