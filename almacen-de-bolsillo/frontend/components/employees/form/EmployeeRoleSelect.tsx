import { EMPLOYEE_ROLES, ROLE_LABELS, type EmployeeRole } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Keyboard, Pressable, Text, View, useColorScheme } from "react-native";

type Props = {
  value: EmployeeRole;
  onChange: (role: EmployeeRole) => void;
  disabled: boolean;
};

export function EmployeeRoleSelect({ value, onChange, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = useColorScheme() === "dark";

  return (
    <View>
      <Text className="mb-2 font-semibold text-gray-950 dark:text-white">Rol *</Text>
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Rol: ${ROLE_LABELS[value]}. Seleccionar rol`}
        accessibilityState={{ expanded: isOpen, disabled }}
        onPress={() => {
          Keyboard.dismiss();
          setIsOpen((current) => !current);
        }}
        className={`h-12 flex-row items-center justify-between rounded-xl border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900 ${disabled ? "opacity-50" : ""}`}
      >
        <Text className="text-base text-black dark:text-white">{ROLE_LABELS[value]}</Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={isDark ? "#9ca3af" : "#6b7280"}
        />
      </Pressable>

      {isOpen && (
        <View className="mt-2 gap-1 rounded-xl border border-gray-200 bg-white p-1.5 dark:border-gray-700 dark:bg-gray-900">
          {EMPLOYEE_ROLES.map((role) => {
            const selected = role === value;

            return (
              <Pressable
                key={role}
                disabled={disabled}
                accessibilityRole="radio"
                accessibilityLabel={ROLE_LABELS[role]}
                accessibilityState={{ checked: selected, disabled }}
                onPress={() => {
                  onChange(role);
                  setIsOpen(false);
                }}
                className={`min-h-12 flex-row items-center justify-between rounded-lg px-3 py-3 active:opacity-70 ${selected ? "bg-[#E8F3EF] dark:bg-gray-700" : "bg-white dark:bg-gray-900"}`}
              >
                <Text className={`text-base text-gray-950 dark:text-white ${selected ? "font-semibold" : ""}`}>
                  {ROLE_LABELS[role]}
                </Text>
                <Ionicons
                  name={selected ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={selected ? (isDark ? "#a7f3d0" : "#24604B") : "#9ca3af"}
                />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
