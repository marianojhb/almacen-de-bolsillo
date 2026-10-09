import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";

type AuthFieldProps = TextInputProps & {
  label: string;
  isPassword?: boolean;
};

export function AuthField({ label, isPassword = false, editable = true, ...props }: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View>
      <Text className="mb-2 font-semibold text-gray-950 dark:text-white">{label}</Text>
      <View className="h-12 flex-row items-center rounded-xl border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
        <TextInput
          {...props}
          editable={editable}
          accessibilityLabel={label}
          placeholderTextColor="#9ca3af"
          className="h-full flex-1 text-base text-black dark:text-white"
          secureTextEntry={isPassword && !showPassword}
        />
        {isPassword && (
          <Pressable
            disabled={!editable}
            onPress={() => setShowPassword((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            hitSlop={10}
            className="ml-3 p-1"
          >
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#9ca3af" />
          </Pressable>
        )}
      </View>
    </View>
  );
}
