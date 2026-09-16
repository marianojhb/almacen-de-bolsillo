import type { Employee } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, Text } from "react-native";

import { useEmployees } from "@/contexts/employees";
import { getEmployeeName } from "../employee.utils";

type DeleteEmployeeButtonProps = {
    employee: Employee;
    disabled: boolean;
    onBusyChange: (isBusy: boolean) => void;
    onDeleted: () => void;
};

export function DeleteEmployeeButton({ employee, disabled, onBusyChange, onDeleted }: DeleteEmployeeButtonProps) {
    const { permanentlyDeleteEmployee } = useEmployees();
    const employeeName = getEmployeeName(employee);

    const deleteEmployee = async () => {
        try {
            onBusyChange(true);

            await permanentlyDeleteEmployee(employee.id);
            onDeleted();
        } catch (error) {
            Alert.alert(
                "No se pudo eliminar",
                error instanceof Error ? error.message : "Intentá nuevamente.",
            );
        } finally {
            onBusyChange(false);
        }
    };

    const confirmFinalDelete = () => {
        Alert.alert(
            "Confirmación final",
            `¿Confirmás la eliminación definitiva de ${employeeName}?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => { void deleteEmployee(); },
                },
            ],
        );
    };

    const confirmDelete = () => {
        Alert.alert(
            "Eliminar definitivamente",
            `Esta acción eliminará a ${employeeName} y no se puede deshacer.`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Continuar",
                    style: "destructive",
                    onPress: confirmFinalDelete,
                },
            ],
        );
    };

    return (
    <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Eliminar definitivamente a ${employeeName}`}
        onPress={(event) => {
            event.stopPropagation();
            confirmDelete();
        }}
        className="mt-2 flex-row items-center justify-center gap-2 rounded-xl border border-red-400 px-4 py-3 active:opacity-60"
    >
        <Ionicons name="trash-outline" size={20} color="#dc2626" />

        <Text className="font-semibold text-red-600 dark:text-red-400">
            Eliminar definitivamente
        </Text>
    </Pressable>
    );
}