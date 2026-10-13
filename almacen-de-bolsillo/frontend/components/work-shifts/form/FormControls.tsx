import { Ionicons } from "@expo/vector-icons";
import { useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from "react-native";

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View className="gap-2">
      <Text className="font-semibold text-gray-950 dark:text-white">{label}</Text>
      <TextInput placeholderTextColor="#9CA3AF" className="rounded-xl border border-gray-300 bg-white p-3 text-gray-950 dark:border-gray-700 dark:bg-gray-900 dark:text-white" {...props} />
    </View>
  );
}

export function SelectField({ label, value, options, disabled, onChange }: {
  label: string;
  value: number;
  options: { id: number; label: string }[];
  disabled?: boolean;
  onChange: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View className="gap-2">
      <Text className="font-semibold text-gray-950 dark:text-white">{label}</Text>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open, disabled }} disabled={disabled} onPress={() => setOpen(!open)} className="flex-row items-center justify-between rounded-xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
        <Text className="flex-1 text-gray-950 dark:text-white">{options.find((item) => item.id === value)?.label ?? "Seleccionar"}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color="#9CA3AF" />
      </Pressable>
      {open && (
        <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }} className="rounded-xl border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
          {options.length === 0 && <Text className="p-3 text-gray-500">No hay opciones disponibles.</Text>}
          {options.map((item) => (
            <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: value === item.id }} onPress={() => { onChange(item.id); setOpen(false); }} className="flex-row items-center justify-between border-b border-gray-100 p-3 dark:border-gray-800">
              <Text className="flex-1 text-gray-950 dark:text-white">{item.label}</Text>
              {value === item.id && <Ionicons name="checkmark" size={20} color="#16A34A" />}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export function FormPage({ children, saving, onSave, onCancel }: {
  children: ReactNode;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50 dark:bg-black" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerClassName="gap-5 p-4 pb-8" keyboardShouldPersistTaps="handled">
        {children}
        <View className="flex-row gap-3">
          <Pressable accessibilityRole="button" disabled={saving} onPress={onCancel} className="flex-1 items-center rounded-xl border border-gray-300 p-4 dark:border-gray-700">
            <Text className="font-semibold text-gray-950 dark:text-white">Cancelar</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={saving} onPress={onSave} className={`flex-1 items-center rounded-xl bg-[#111A1A] p-4 ${saving ? "opacity-50" : ""}`}>
            <Text className="font-semibold text-white">{saving ? "Guardando…" : "Guardar"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
