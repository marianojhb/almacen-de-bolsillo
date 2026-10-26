import { Stack } from "expo-router";
import { TransactionsProvider } from "@/contexts/transactions";
import { NotebookScene, useNotebookHeader } from "@/components/ui/notebook";

export default function SuppliersLayout() {
  const header = useNotebookHeader();
  return (
    <TransactionsProvider>
      <Stack
        screenLayout={({ children }) => <NotebookScene>{children}</NotebookScene>}
        screenOptions={{
          headerBackButtonDisplayMode: "minimal",
          ...header,
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
