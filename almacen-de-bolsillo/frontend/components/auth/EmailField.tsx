import { useState } from "react";
import { Text, View, type TextInputProps } from "react-native";
import { isValidEmail } from "@almacen/shared";
import { AuthField } from "./AuthField";

type Props = Omit<TextInputProps, "value" | "onChangeText"> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
};

export function EmailField({ label, value, onChangeText, onBlur, ...props }: Props) {
  const [hasBlurred, setHasBlurred] = useState(false);
  return (
    <View>
      <AuthField {...props} label={label} value={value} onChangeText={(text) => onChangeText(text.toLowerCase())}
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={254}
        onBlur={(event) => { setHasBlurred(true); onBlur?.(event); }} />
      {hasBlurred && !isValidEmail(value) && (
        <Text accessibilityRole="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          Ingresá un correo válido, por ejemplo nombre@dominio.com.
        </Text>
      )}
    </View>
  );
}
