// @/app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ActivityIndicator, Text, View } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { AuthButton } from "@/components/auth/AuthButton";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootNavigator() {
  const { session, isRestoring, restorationError, retrySession } = useAuth();

  if (isRestoring || restorationError) {
    return (
      <View className="flex-1 items-center justify-center gap-5 bg-gray-50 px-6 dark:bg-black">
        {isRestoring ? (
          <>
            <ActivityIndicator size="large" color="#9ca3af" />
            <Text className="text-gray-600 dark:text-gray-300">Comprobando sesión...</Text>
          </>
        ) : (
          <>
            <Text className="text-center text-base text-gray-600 dark:text-gray-300">{restorationError}</Text>
            <AuthButton label="Reintentar" onPress={() => void retrySession()} />
          </>
        )}
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={session !== null}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={session === null}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
