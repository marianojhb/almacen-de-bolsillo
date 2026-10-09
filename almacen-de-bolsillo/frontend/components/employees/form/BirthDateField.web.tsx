import { Text, View, useColorScheme } from "react-native";
import { birthDateInputToIso, dateToLocalIso, formatBirthDateDisplay, formatBirthDateInput } from "@almacen/shared";
import { AuthField } from "@/components/auth/AuthField";

type Props = { value: string; onChange: (value: string) => void; disabled: boolean };

export function BirthDateField({ value, onChange, disabled }: Props) {
  const isDark = useColorScheme() === "dark";
  return (
    <View className="gap-2">
      <AuthField label="Fecha de nacimiento" value={value} placeholder="DD/MM/AAAA" keyboardType="number-pad"
        editable={!disabled} maxLength={10} onChangeText={(text) => onChange(formatBirthDateInput(text, value))} />
      <Text className="text-xs text-gray-500 dark:text-gray-400">También podés elegirla en el calendario:</Text>
      <input type="date" aria-label="Elegir fecha de nacimiento" disabled={disabled}
        value={birthDateInputToIso(value) ?? ""} max={dateToLocalIso(new Date())}
        onChange={(event) => onChange(formatBirthDateDisplay(event.target.value))}
        style={{ padding: 12, borderRadius: 12, border: `1px solid ${isDark ? "#374151" : "#d1d5db"}`,
          background: isDark ? "#111827" : "#ffffff", color: isDark ? "#ffffff" : "#111827", colorScheme: isDark ? "dark" : "light", fontSize: 16 }} />
    </View>
  );
}
