import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useUtilityColorScheme } from "nativewind";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";

type ThemePreferenceContextValue = {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
};

export const THEME_PREFERENCE_STORAGE_KEY = "theme-preference";

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("system");
  const { setColorScheme } = useUtilityColorScheme();

  useEffect(() => {
    let isMounted = true;
    setColorScheme("system");

    void AsyncStorage.getItem(THEME_PREFERENCE_STORAGE_KEY)
      .then((storedPreference) => {
        if (!isMounted || !isThemePreference(storedPreference)) return;
        setThemePreferenceState(storedPreference);
        setColorScheme(storedPreference);
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [setColorScheme]);

  const setThemePreference = useCallback(
    (preference: ThemePreference) => {
      setThemePreferenceState(preference);
      setColorScheme(preference);
      void AsyncStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, preference).catch(() => undefined);
    },
    [setColorScheme],
  );

  const value = useMemo(
    () => ({ themePreference, setThemePreference }),
    [setThemePreference, themePreference],
  );

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);
  if (!context) throw new Error("useThemePreference debe usarse dentro de ThemePreferenceProvider.");
  return context;
}
