import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, useColorScheme } from "react-native";

type EditEmployeeButtonProps = {
    id: number;
    employeeName: string;
    disabled?: boolean;
};

export function EditEmployeeButton({ id, employeeName, disabled = false }: EditEmployeeButtonProps) {
    const isDark = useColorScheme() === "dark";

    return (
    <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${employeeName}`}
        onPress={(event) => {
            event.stopPropagation();

            router.push({
                pathname: "/more/employees/[id]/edit",
                params: {
                    id: id.toString(),
                },
            });
        }}
        className="h-10 w-10 items-center justify-center rounded-xl border border-gray-300 active:opacity-60 dark:border-gray-600"
    >
        <Ionicons
            name="create-outline"
            size={21}
            color={isDark ? "#d1d5db" : "#4b5563"}
        />
    </Pressable>
  );
}