// @/app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { useColorScheme as useUtilityColorScheme } from "nativewind";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import "../global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotebookPaper, NotebookScene } from "@/components/ui/notebook";
import { notebook, notebookFonts } from "@/constants/notebook";

SplashScreen.setOptions({ duration: 0, fade: false });
void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppNavigation() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();
  const palette = colorScheme === "dark" ? notebook.dark : notebook;
  const baseTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const theme = {
    ...baseTheme,
    colors: { ...baseTheme.colors, primary: palette.ink, background: "transparent", card: palette.paper, text: palette.ink, border: palette.border, notification: palette.pencil },
  };
  return (
    <ThemeProvider value={theme}>
      <View style={{ flex: 1, backgroundColor: palette.paper }}>
      <NotebookPaper />
      <Stack
        screenLayout={({ children }) => <NotebookScene>{children}</NotebookScene>}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.paper },
        }}
      >
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="login" />
          <Stack.Screen name="create-owner" />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
      </View>

      <StatusBar style={isAuthenticated && colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { setColorScheme } = useUtilityColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    [notebookFonts.handwriting]: require("../assets/fonts/Caveat.ttf"),
  });
  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hide();
  }, [fontsLoaded, fontError]);
  useEffect(() => {
    setColorScheme(systemColorScheme ?? "light");
  }, [setColorScheme, systemColorScheme]);

  if (!fontsLoaded && !fontError) return null;
  return <AuthProvider><AppNavigation /></AuthProvider>;
}
