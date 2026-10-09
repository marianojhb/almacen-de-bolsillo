import { useCommerceFormat } from "@/hooks/use-commerce-format";
import type { Employee } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { DeleteEmployeeButton } from "./buttons/DeleteEmployeeButton";
import { EditEmployeeButton } from "./buttons/EditEmployeeButton";
import { EmployeeStatusButton } from "./buttons/EmployeeStatusButton";
import {
    employeeGenderLabels,
    formatEmployeeCode,
    getEmployeeName,
} from "./employee.utils";

type EmployeeCardProps = {
    employee: Employee;
    isExpanded: boolean;
    onToggle: () => void;
    onDeleted: () => void;
};

function DetailRow({ label, value }: { label: string; value: string | null; }) {
    return (
    <View className="mb-3">
        <Text className="text-xs font-semibold uppercase text-gray-400">
            {label}
        </Text>

        <Text className="mt-1 text-base text-gray-800 dark:text-gray-100">
            {value || "No informado"}
        </Text>
    </View>
    );
}

export function EmployeeCard({ employee, isExpanded, onToggle, onDeleted }: EmployeeCardProps) {
  const { formatCurrency, formatDate, formatCalendarDate } = useCommerceFormat();
    const [isChanging, setIsChanging] = useState(false);
    const employeeName = getEmployeeName(employee);

    const salary = employee.salary === null
    ? null
    : formatCurrency(employee.salary);

    return (
    <Pressable
        disabled={isChanging}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`Mostrar información de ${employeeName}`}
        accessibilityState={{
            expanded: isExpanded,
            disabled: isChanging,
        }}
        className={`rounded-2xl border p-4 active:opacity-80 ${
            employee.isActive
            ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
            : "border-gray-400 bg-gray-100 opacity-70 dark:border-gray-600 dark:bg-gray-800"
        } ${isChanging ? "opacity-50" : ""}`}
        >
        <View className="flex-row items-center">
            <View className="mr-3 flex-1">
                <View className="flex-row items-center gap-2">
                    <Text className="flex-shrink text-lg font-semibold text-gray-950 dark:text-white">
                        {employeeName}
                    </Text>

                    <View
                        className={`rounded-full px-2.5 py-1 ${
                        employee.isActive
                        ? "bg-green-100 dark:bg-green-950"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                    >
                        <Text
                            className={`text-xs font-semibold ${
                            employee.isActive
                            ? "text-green-700 dark:text-green-300"
                            : "text-gray-700 dark:text-gray-300"
                            }`}
                        >
                            {employee.isActive ? "Activo" : "Inactivo"}
                        </Text>
                    </View>
                </View>

                <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {formatEmployeeCode(employee.commerceEmployeeId)} · DNI:{" "}
                    {employee.dni ?? "No informado"}
                </Text>
            </View>

            <View className="flex-row items-center gap-2">
                <EditEmployeeButton
                    id={employee.id}
                    employeeName={employeeName}
                    disabled={isChanging}
                />

                <EmployeeStatusButton
                    employee={employee}
                    disabled={isChanging}
                    onBusyChange={setIsChanging}
                />

                <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={22}
                    color="#9ca3af"
                />
            </View>
        </View>
        {isExpanded && (
            <View className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <DetailRow
                    label="Código"
                    value={formatEmployeeCode(employee.commerceEmployeeId)}
                />

                <DetailRow label="Usuario" value={employee.account?.username ?? "No tiene usuario"} />
                {employee.account && <DetailRow label="Rol" value={employee.account.role.name} />}
                <DetailRow label="CUIL" value={employee.cuil} />
                <DetailRow
                    label="Fecha de nacimiento"
                    value={formatCalendarDate(employee.dob)}
                />
                <DetailRow
                    label="Género"
                    value={employeeGenderLabels[employee.gender]}
                />
                <DetailRow label="Puesto" value={employee.jobTitle} />
                <DetailRow label="Salario" value={salary} />
                <DetailRow
                    label="Fecha de registro"
                    value={formatDate(employee.createdAt)}
                />
                <DeleteEmployeeButton
                    employee={employee}
                    disabled={isChanging}
                    onBusyChange={setIsChanging}
                    onDeleted={onDeleted}
                />
            </View>
        )}
    </Pressable>
    );
}
