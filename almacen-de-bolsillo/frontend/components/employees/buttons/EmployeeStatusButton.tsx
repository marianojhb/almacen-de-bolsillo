import type { Employee } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable } from "react-native";

import { useEmployees } from "@/contexts/employees";
import { getEmployeeName } from "../employee.utils";

type EmployeeStatusButtonProps = {
    employee: Employee;
    disabled: boolean;
    onBusyChange: (isBusy: boolean) => void;
};

export function EmployeeStatusButton({ employee, disabled, onBusyChange }: EmployeeStatusButtonProps) {
    const { deactivateEmployee, updateEmployee } = useEmployees();

    const employeeName = getEmployeeName(employee);
    const isActive = employee.isActive;

    const changeStatus = async () => {
        try {
            onBusyChange(true);

            if (isActive) {
                await deactivateEmployee(employee.id);
            } else {
                await updateEmployee(employee.id, { isActive: true });

                Alert.alert(
                    "Empleado activado",
                    `${employeeName} fue dado de alta correctamente.`,
                );
            }
        } catch (error) {
            Alert.alert(
                isActive ? "No se pudo dar de baja" : "No se pudo activar",
                error instanceof Error ? error.message : "Intentá nuevamente.",
            );
        } finally {
            onBusyChange(false);
        }
    };

    const confirmChange = () => {
        Alert.alert(
            isActive ? "Dar de baja empleado" : "Dar de alta empleado",
            isActive
            ? `¿Querés dar de baja a ${employeeName}? Podrás volver a activarlo.`
            : `¿Querés volver a activar a ${employeeName}?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: isActive ? "Dar de baja" : "Dar de alta",
                    style: isActive ? "destructive" : "default",
                    onPress: () => { void changeStatus(); },
                },
            ],
        );
    };

    return (
    <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${isActive ? "Dar de baja" : "Dar de alta"} ${employeeName}`}
        onPress={(event) => {
            event.stopPropagation();
            confirmChange();
        }}
        className={`h-10 w-10 items-center justify-center rounded-xl border active:opacity-60 ${
            isActive ? "border-red-300" : "border-green-400"
        }`}
    >
        <Ionicons
            name={
                isActive
                ? "arrow-down-circle-outline"
                : "arrow-up-circle-outline"
            }
            size={22}
            color={isActive ? "#dc2626" : "#16a34a"}
        />
    </Pressable>
    );
}