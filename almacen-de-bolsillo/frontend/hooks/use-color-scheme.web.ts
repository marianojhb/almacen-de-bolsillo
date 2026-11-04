import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemePreference } from "@/contexts/ThemePreferenceContext";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { themePreference } = useThemePreference();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const systemColorScheme = useRNColorScheme();

  if (hasHydrated) {
    return themePreference === "system" ? systemColorScheme : themePreference;
  }

  return 'light';
}
