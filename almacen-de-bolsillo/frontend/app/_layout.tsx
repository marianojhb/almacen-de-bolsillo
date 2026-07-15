import { ProductsProvider } from "@/contexts/ProductsProvider";

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
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="products/new"
            options={{
              title: "Nuevo producto",
              headerBackButtonDisplayMode: "minimal",
            }}
          />
          <Stack.Screen
            name="products/[id]"
            options={{
              title: "Producto",
              headerBackButtonDisplayMode: "minimal",
            }}
          />
        </Stack>
      </ProductsProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
