import { ROLE_LABELS, type Employee } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { EditEmployeeButton } from "./buttons/EditEmployeeButton";
import { EmployeeStatusButton } from "./buttons/EmployeeStatusButton";
import {
    employeeGenderLabels,
    formatEmployeeCode,
    formatEmployeeDate,
    getEmployeeName,
} from "./employee.utils";

type EmployeeCardProps = {
    employee: Employee;
    isExpanded: boolean;
    onToggle: () => void;
};

function DetailRow({ label, value }: { label: string; value: string | null; }) {
    return (
    <View className="mb-3">
        <Text className="text-xs font-semibold uppercase text-slate-400">
            {label}
        </Text>

        <Text className="mt-1 text-base text-slate-800 dark:text-slate-100">
            {value || "No informado"}
        </Text>
    </View>
    );
}

export function EmployeeCard({ employee, isExpanded, onToggle }: EmployeeCardProps) {
    const [isChanging, setIsChanging] = useState(false);
    const employeeName = getEmployeeName(employee);
    const isActive = employee.isActive && employee.user?.isActive !== false;

    const salary = employee.salary === null
    ? null
    : Number(employee.salary).toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
    });

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
        className={`rounded-3xl border p-4 active:opacity-80 ${
            isActive
            ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
            : "border-slate-300 bg-slate-100 opacity-70 dark:border-slate-700 dark:bg-slate-900"
        } ${isChanging ? "opacity-50" : ""}`}
        >
        <View className="flex-row items-center">
            <View className="mr-3 flex-1">
                <View className="flex-row items-center gap-2">
                    <Text className="flex-shrink text-lg font-black text-slate-950 dark:text-white">
                        {employeeName}
                    </Text>

                    <View
                        className={`rounded-full px-2.5 py-1 ${
                        isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/60"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                    >
                        <Text
                            className={`text-xs font-semibold ${
                            isActive
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-slate-600 dark:text-slate-300"
                            }`}
                        >
                            {isActive ? "Activo" : "Usuario desactivado"}
                        </Text>
                    </View>
                </View>

                <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {formatEmployeeCode(employee.id)} · DNI:{" "}
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
            <View className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                <DetailRow
                    label="Código"
                    value={formatEmployeeCode(employee.id)}
                />

                <DetailRow label="CUIL" value={employee.cuil} />
                <DetailRow
                    label="Fecha de nacimiento"
                    value={formatEmployeeDate(employee.dob)}
                />
                <DetailRow
                    label="Género"
                    value={employeeGenderLabels[employee.gender]}
                />
                <DetailRow label="Puesto" value={employee.jobTitle} />
                <DetailRow label="Salario" value={salary} />
                <DetailRow label="Email de acceso" value={employee.user?.email ?? null} />
                <DetailRow label="Rol" value={employee.user ? ROLE_LABELS[employee.user.role] : null} />
                <DetailRow
                    label="Fecha de registro"
                    value={formatEmployeeDate(employee.createdAt)}
                />
            </View>
        )}
    </Pressable>
    );
}
