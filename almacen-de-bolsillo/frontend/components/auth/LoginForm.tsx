import { useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View, useColorScheme } from "react-native";
import { useAuth } from "@/contexts/auth";
import { AuthField } from "./AuthField";
import { AuthButton } from "./AuthButton";
import { validateLoginForm } from "./auth-form.utils";

type LoginFormProps = {
  initialCommerceUsername?: string;
  onRegister: () => void;
};

export function LoginForm({ initialCommerceUsername = "", onRegister }: LoginFormProps) {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<"commerce" | "user">("commerce");
  const [commerceUsername, setCommerceUsername] = useState(initialCommerceUsername.toLowerCase());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const isDark = useColorScheme() === "dark";

  const changeMode = (nextMode: "commerce" | "user") => {
    setMode(nextMode);
    setPassword("");
    setError(null);
  };

  const handleSubmit = async () => {
    if (submitting.current) return;
    const message = validateLoginForm(commerceUsername, username, password, mode);
    if (message) { setError(message); return; }
    submitting.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const common = { commerceUsername: commerceUsername.trim().toLowerCase(), password };
      await signIn(mode === "commerce"
        ? { mode: "commerce", ...common }
        : { mode: "user", ...common, username: username.trim().toLowerCase() });
      setPassword("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-5">
      <View className="flex-row gap-2 rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
        {(["commerce", "user"] as const).map((option) => {
          const selected = mode === option;
          return (
            <Pressable
              key={option}
              disabled={isSubmitting}
              onPress={() => changeMode(option)}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: isSubmitting }}
              className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 ${selected ? "bg-[#111A1A] dark:bg-white" : "bg-transparent"}`}
            >
              <Ionicons
                name={option === "commerce" ? "storefront-outline" : "person-outline"}
                size={22}
                color={selected ? (isDark ? "#111A1A" : "#ffffff") : "#9ca3af"}
              />
              <Text className={`font-semibold ${selected ? "text-white dark:text-black" : "text-gray-600 dark:text-gray-300"}`}>
                {option === "commerce" ? "Comercio" : "Usuario"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
        {mode === "commerce" ? "Acceso del dueño del comercio." : "Los usuarios solo pueden iniciar sesión. Su cuenta la crea el administrador."}
      </Text>

      <View className="gap-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <View className="mb-1">
          <Text className="text-2xl font-bold text-gray-950 dark:text-white">Iniciar sesión</Text>
          <Text className="mt-2 text-gray-500 dark:text-gray-400">
            {mode === "commerce" ? "Ingresá con tu comercio y la contraseña del dueño." : "Ingresá con tu comercio y tu cuenta personal."}
          </Text>
        </View>
        <AuthField label="Usuario del comercio" value={commerceUsername} onChangeText={(value) => setCommerceUsername(value.toLowerCase())}
          placeholder="Ej.: prueba" autoCapitalize="none" autoCorrect={false} maxLength={40} editable={!isSubmitting} />
        <Text className="-mt-3 text-xs text-gray-500 dark:text-gray-400">Los nombres de usuario se escriben en minúsculas.</Text>
        {mode === "user" && (
          <AuthField label="Usuario personal" value={username} onChangeText={(value) => setUsername(value.toLowerCase())}
            placeholder="Tu usuario" autoCapitalize="none" autoCorrect={false} maxLength={254} editable={!isSubmitting} />
        )}
        <AuthField label={mode === "commerce" ? "Contraseña del dueño" : "Contraseña"}
          value={password} onChangeText={setPassword} placeholder="Tu contraseña" isPassword
          autoCapitalize="none" autoCorrect={false} maxLength={128} editable={!isSubmitting}
          onSubmitEditing={() => void handleSubmit()} returnKeyType="go" />
        {error && <Text accessibilityRole="alert" className="text-sm text-red-600 dark:text-red-400">{error}</Text>}
        <AuthButton label={isSubmitting ? "Ingresando..." : "Iniciar sesión"} loading={isSubmitting} onPress={() => void handleSubmit()} />
        {mode === "commerce" && <AuthButton label="Registrar un comercio" secondary disabled={isSubmitting} onPress={onRegister} />}
      </View>
    </View>
  );
}
