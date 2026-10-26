import { Stack } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";
import { NotebookScene, useNotebookHeader } from "@/components/ui/notebook";

export default function MoreLayout() {
  const header = useNotebookHeader();
  const { can, hasFullAccess } = usePermissions();
  return (
    <Stack
      screenLayout={({ children }) => <NotebookScene>{children}</NotebookScene>}
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        ...header,
        title: "Más",
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Más",
          headerShown: false,
        }}
      />

      <Stack.Protected guard={can("suppliers", "read")}>
      <Stack.Screen 
        name="suppliers" 
        options={{ headerShown: false }} 
      />
      </Stack.Protected>
      <Stack.Protected guard={hasFullAccess}>
      <Stack.Screen 
        name="transactions" 
        options={{ headerShown: false }}
      />
      </Stack.Protected>
      <Stack.Protected guard={can("employees", "read")}>
      <Stack.Screen
        name="employees"
        options={{ headerShown: false }}
      />
      </Stack.Protected>
      <Stack.Protected guard={can("workShifts", "read")}>
      <Stack.Screen
        name="work-shifts"
         options={{ headerShown: false }}
      />
      </Stack.Protected>
      <Stack.Screen
        name="cash-closing"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="account"
        options={{ title: "Mi cuenta" }}
      />
    </Stack>
  );
}
