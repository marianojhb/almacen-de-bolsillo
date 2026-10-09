import { ActivityIndicator, Pressable, Text } from "react-native";

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  secondary?: boolean;
};

export function AuthButton({ label, onPress, loading = false, disabled = false, secondary = false }: AuthButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      className={`flex-row items-center justify-center gap-2 rounded-xl border p-4 active:opacity-70 ${
        secondary
          ? "border-gray-300 bg-transparent dark:border-gray-700"
          : "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
      } ${disabled || loading ? "opacity-50" : ""}`}
    >
      {loading && <ActivityIndicator color="#9ca3af" />}
      <Text className={`font-semibold ${secondary ? "text-gray-950 dark:text-white" : "text-white dark:text-black"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
