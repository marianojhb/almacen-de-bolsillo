// @/app/_layout.tsx
import { ProductsProvider } from "@/contexts/products";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ProductsProvider>
        <Stack screenOptions={{ headerShown: false }} />

        <StatusBar style="auto" />
      </ProductsProvider>
    </ThemeProvider>
  );
}
