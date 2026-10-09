import { Stack, useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";
import { BackButton } from "@/components/BackButton";
import { useAuth } from "@/contexts/auth";
import { WorkShiftsProvider } from "@/contexts/work-shifts";

export default function WorkShiftsLayout() {
  const { session } = useAuth();
  const router = useRouter();
  const canManage = session?.permissions.includes("work_shifts.manage") ?? false;
  const stateKey = `${session?.user.id}:${session?.employee?.id}:${session?.commerce.timeZone}:${session?.permissions.join("|")}`;
  return (
    <WorkShiftsProvider key={stateKey}>
      <Stack screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: "#111A1A" }, headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "900" }, headerBackVisible: false,
        headerLeft: () => route.name === "index" ? (session?.isOwner ?
          <Pressable accessibilityRole="button" accessibilityLabel="Volver a Más" onPress={() => router.navigate("/(tabs)/more" as Href)}
            className="mr-3 min-h-11 flex-row items-center gap-1 pr-2 active:opacity-60">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" /><Text className="text-base font-semibold text-white">Volver</Text>
          </Pressable> : null) : <BackButton fallback={"/work-shifts" as Href} />,
      })}>
        <Stack.Screen name="index" options={{ title: session?.permissions.includes("work_shifts.read") ? "Turnos laborales" : "Mis turnos" }} />
        <Stack.Protected guard={canManage}>
          <Stack.Screen name="types/new" options={{ title: "Nuevo tipo de jornada" }} />
          <Stack.Screen name="types/[id]/edit" options={{ title: "Editar tipo de jornada" }} />
          <Stack.Screen name="[id]/edit" options={{ title: "Editar observaciones" }} />
        </Stack.Protected>
      </Stack>
    </WorkShiftsProvider>
  );
}
