import { router } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ReviewPurchaseScreen() {
  return (
    <>
      <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-[#071111]">
        <Text>Revisar Compra</Text>
      </View>
      <Pressable
        onPress={() => {
          router.dismissTo("/(tabs)/purchases/new");
        }}>
        <Text>Go Back</Text>
      </Pressable>

      <View className="flex-column ms-auto items-center justify-center">
        <Pressable
          className="w-44 ms-auto mt-4 rounded-lg bg-green-800 p-3 items-center"
          onPress={() => router.dismissTo("/(tabs)/purchases/new")}>
          <Text className="text-white font-bold">
            Continuar <Ionicons name="arrow-forward" size={18} color="white" />
          </Text>
        </Pressable>
      </View>
    </>
  );
}
