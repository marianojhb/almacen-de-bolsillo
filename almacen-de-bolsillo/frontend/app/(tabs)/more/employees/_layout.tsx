import { BackButton } from "@/components/BackButton";
import { usePermissions } from "@/hooks/use-permissions";
import { Stack } from "expo-router";

export const unstable_settings = { initialRouteName: "index" };

export default function EmployeesLayout() {
  const { can } = usePermissions();
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerBackVisible: false,
        headerLeft: () => <BackButton fallback="/more" toParent={route.name === "index"} />,
        headerBackButtonDisplayMode:
          "minimal",
        statusBarBackgroundColor:
          "#111A1A",
        headerStyle: {
          backgroundColor: "#111A1A",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "900",
        },
      })}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Empleados",
        }}
      />

      <Stack.Protected guard={can("employees.create")}>
        <Stack.Screen
          name="new"
          options={{
            title: "Nuevo empleado",
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={can("employees.update")}>
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
