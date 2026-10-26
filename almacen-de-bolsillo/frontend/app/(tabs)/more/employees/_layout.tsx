import { Stack } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";
import { NotebookScene, useNotebookHeader } from "@/components/ui/notebook";

export default function EmployeesLayout() {
  const header = useNotebookHeader();
  const { can } = usePermissions();
  return (
    <Stack
      screenLayout={({ children }) => <NotebookScene>{children}</NotebookScene>}
      screenOptions={{
        headerBackButtonDisplayMode:
          "minimal",
        ...header,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Empleados",
        }}
      />

      <Stack.Protected guard={can("employees", "create")}>
      <Stack.Screen
        name="new"
        options={{
          title: "Nuevo empleado",
        }}
      />

      </Stack.Protected>
      <Stack.Protected guard={can("employees", "update")}>
      <Stack.Screen
        name="[id]/edit"
        options={{
          title: "Editar empleado",
        }}
      />
      </Stack.Protected>
    </Stack>
  );
}
