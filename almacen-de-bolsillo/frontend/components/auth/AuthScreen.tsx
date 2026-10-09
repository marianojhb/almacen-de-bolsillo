import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function AuthScreen({ children }: { children: ReactNode }) {
  const isDark = useColorScheme() === "dark";

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          contentContainerClassName="px-4 py-8"
        >
          <View className="w-full max-w-lg self-center">
            <View className="mb-8 items-center">
              <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-[#111A1A] dark:bg-white">
                <Ionicons name="storefront-outline" size={44} color={isDark ? "#111A1A" : "#ffffff"} />
              </View>
              <Text className="text-center text-3xl font-black text-gray-950 dark:text-white">Almacén de Bolsillo</Text>
              <Text className="mt-3 text-center text-base text-gray-500 dark:text-gray-400">
                Tu comercio, organizado en un solo lugar.
              </Text>
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
