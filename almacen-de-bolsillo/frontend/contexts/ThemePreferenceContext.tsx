import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useUtilityColorScheme } from "nativewind";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  const setColorSchemeRef = useRef(setColorScheme);
  const hasManualSelectionRef = useRef(false);

  useEffect(() => {
    setColorSchemeRef.current = setColorScheme;
  }, [setColorScheme]);

  useEffect(() => {
    let isMounted = true;

    void AsyncStorage.getItem(THEME_PREFERENCE_STORAGE_KEY)
      .then((storedPreference) => {
        if (!isMounted || hasManualSelectionRef.current || !isThemePreference(storedPreference)) return;
        setThemePreferenceState(storedPreference);
        setColorSchemeRef.current(storedPreference);
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const setThemePreference = useCallback(
    (preference: ThemePreference) => {
      hasManualSelectionRef.current = true;
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
