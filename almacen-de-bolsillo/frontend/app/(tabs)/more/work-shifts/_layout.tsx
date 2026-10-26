import { router, Stack, type Href } from "expo-router";
import { Pressable, Text } from "react-native";
import { usePermissions } from "@/hooks/usePermissions";
import { NotebookScene, useNotebookHeader } from "@/components/ui/notebook";

export default function WorkShiftsLayout() {
  const header = useNotebookHeader();
  const { can } = usePermissions();
  return (
    <Stack
      screenLayout={({ children }) => <NotebookScene>{children}</NotebookScene>}
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        ...header,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Turnos laborales",
          headerLeft: () => (
            <Pressable accessibilityRole="button" onPress={() => router.replace("/more" as Href)}>
              <Text style={{ color: header.headerTintColor, marginRight: 12 }}>‹ Más</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Protected guard={can("workShifts", "create") || can("workShifts", "update")}>
        <Stack.Screen name="shift" options={{ title: "Asignar / editar turno" }} />
      </Stack.Protected>
      <Stack.Protected guard={can("workShiftTypes", "create") || can("workShiftTypes", "update")}>
        <Stack.Screen name="type" options={{ title: "Crear / editar jornada" }} />
      </Stack.Protected>
    </Stack>
  );
}
