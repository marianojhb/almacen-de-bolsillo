import { Stack } from "expo-router";

export default function EmployeesLayout() {
  return (
    <Stack
      screenOptions={{
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
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Empleados",
        }}
      />

      <Stack.Screen
        name="new"
        options={{
          title: "Nuevo empleado",
        }}
      />

      <Stack.Screen
        name="[id]/edit"
        options={{
          title: "Editar empleado",
        }}
      />
    </Stack>
  );
}