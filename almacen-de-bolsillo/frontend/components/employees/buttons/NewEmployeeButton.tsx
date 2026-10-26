import { Ionicons } from "@expo/vector-icons";
import { usePermissions } from "@/hooks/usePermissions";
import { router } from "expo-router";
import { Pressable, Text } from "react-native";

export function NewEmployeeButton() {
    const { can } = usePermissions();
    if (!can("employees", "create")) return null;

    return (
    <Pressable
        onPress={() => router.push("/more/employees/new")}
        accessibilityRole="button"
        accessibilityLabel="Registrar empleado"
        className="min-h-12 flex-row items-center gap-2 rounded-xl bg-ink px-3 py-2.5 active:opacity-75"
    >
        <Ionicons
            name="add"
            size={20}
            color="#ffffff"
        />

        <Text className="text-sm font-black text-white">
            Nuevo
        </Text>
    </Pressable>
    );
}
