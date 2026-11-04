import { useColorScheme as useRNColorScheme } from "react-native";
import { useThemePreference } from "@/contexts/ThemePreferenceContext";

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const { themePreference } = useThemePreference();

  return themePreference === "system" ? systemColorScheme : themePreference;
}
