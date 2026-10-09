import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export function InfoHint({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  return <View style={{ position: "relative", zIndex: 20 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded: open }}
      onPress={() => setOpen(!open)} hitSlop={8} className="h-10 w-10 items-center justify-center">
      <Ionicons name={open ? "information-circle" : "information-circle-outline"} size={23} color="#059669" />
    </Pressable>
    {open && <View style={{ position: "absolute", right: 0, top: 42, width: 270, zIndex: 20 }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <Text className="text-sm text-gray-700 dark:text-gray-200">{text}</Text>
    </View>}
  </View>;
}
