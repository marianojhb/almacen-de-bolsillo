import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, useColorScheme } from "react-native";

export function NewEmployeeButton() {
    const isDark = useColorScheme() === "dark";

    return (
    <Pressable
        onPress={() => router.push("/more/employees/new")}
        accessibilityRole="button"
        accessibilityLabel="Registrar empleado"
        className="flex-row items-center gap-2 rounded-xl bg-[#111A1A] px-4 py-3 active:opacity-75 dark:bg-white"
    >
        <Ionicons
            name="add"
            size={20}
            color={isDark ? "#111111" : "#ffffff"}
        />

        <Text className="font-semibold text-white dark:text-black">
            Nuevo
        </Text>
    </Pressable>
    );
}