import { Text, View, useColorScheme } from "react-native";
import { isWorkShiftDate, isWorkShiftTime } from "@almacen/shared";
import type { CalendarFieldProps } from "./CalendarField";

export function CalendarField({ label, mode, value, onChange, disabled = false, showLabel = true }: CalendarFieldProps) {
  const isDark = useColorScheme() === "dark";
  return (
    <View className="gap-2">
      {showLabel && <Text className="font-semibold text-gray-950 dark:text-white">{label}</Text>}
      <input type={mode} value={value} disabled={disabled} aria-label={label}
        onChange={(event) => {
          const next = event.target.value;
          if (mode === "date" ? isWorkShiftDate(next) : isWorkShiftTime(next)) onChange(next);
        }}
        style={{ width: "100%", minHeight: 48, boxSizing: "border-box", borderRadius: 12, padding: 12,
          border: `1px solid ${isDark ? "#374151" : "#D1D5DB"}`, colorScheme: isDark ? "dark" : "light",
          background: isDark ? "#111827" : "#FFFFFF", color: isDark ? "#FFFFFF" : "#111827", fontSize: 16 }} />
    </View>
  );
}
