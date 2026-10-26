import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import {
  useThemePreference,
  type ThemePreference,
} from "@/contexts/ThemePreferenceContext";

const options: { value: ThemePreference; label: string; icon: ComponentProps<typeof Ionicons>["name"] }[] = [
  { value: "light", label: "Claro", icon: "sunny-outline" },
  { value: "dark", label: "Oscuro", icon: "moon-outline" },
  { value: "system", label: "Sistema", icon: "phone-portrait-outline" },
];

export function ThemeSelector() {
  const { themePreference, setThemePreference } = useThemePreference();

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-bold text-ink dark:text-white">Apariencia</Text>
      <View className="flex-row gap-1 rounded-xl border border-slate-300 bg-white/60 p-1 dark:border-slate-700 dark:bg-slate-950">
        {options.map((option) => {
          const isSelected = themePreference === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={`Usar tema ${option.label.toLowerCase()}`}
              accessibilityState={{ selected: isSelected }}
              className={`min-h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg px-2 active:opacity-70 ${
                isSelected ? "bg-ink dark:bg-emerald-700" : "bg-transparent"
              }`}
              onPress={() => setThemePreference(option.value)}>
              <Ionicons
                name={option.icon}
                size={17}
                color={isSelected ? "#FFFCF3" : "#5B6A60"}
              />
              <Text
                className={`text-xs font-bold ${
                  isSelected ? "text-white" : "text-slate-600 dark:text-slate-300"
                }`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
