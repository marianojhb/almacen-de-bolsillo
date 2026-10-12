// @/app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppNavigation() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
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

      <StatusBar style={isAuthenticated && colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return <AuthProvider><AppNavigation /></AuthProvider>;
}
