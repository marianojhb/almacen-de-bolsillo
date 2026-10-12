import type { LoginDto } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { authStyles } from "./AuthShell";

type Props = {
  mode: "login" | "create-owner";
  onSubmit: (credentials: LoginDto) => Promise<void>;
  disabled?: boolean;
};

export function CredentialsForm({ mode, onSubmit, disabled = false }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const creating = mode === "create-owner";
  const busy = disabled || isSubmitting;

  async function submit() {
    if (busy) return;
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Ingresá un email válido.");
      return;
    }
    if (!password || password.length > 128 || (creating && password.length < 8)) {
      setError(creating ? "La contraseña debe tener entre 8 y 128 caracteres." : "Ingresá tu contraseña (hasta 128 caracteres).");
      return;
    }
    if (creating && password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit({ email: normalizedEmail, password });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo completar la operación.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View>
      <Text style={styles.label}>Email de ingreso</Text>
      <View style={styles.inputRow}>
        <Ionicons name="mail-outline" size={23} color="#747B91" />
        <TextInput
          accessibilityLabel="Email de ingreso"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com"
          placeholderTextColor="#81889D"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          editable={!busy}
        />
      </View>
      <Text style={styles.hint}>Usá el email con el que accedés a tu cuenta.</Text>
      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.inputRow}>
        <Ionicons name="lock-closed-outline" size={23} color="#747B91" />
        <TextInput
          accessibilityLabel="Contraseña"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Tu contraseña"
          placeholderTextColor="#81889D"
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={creating ? "new-password" : "current-password"}
          editable={!busy}
          onSubmitEditing={() => { if (!creating) void submit(); }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onPress={() => setVisible((current) => !current)}
          hitSlop={10}
          disabled={busy}
        >
          <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={24} color="#747B91" />
        </Pressable>
      </View>
      {creating && (
        <View style={{ marginTop: 14 }}>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={23} color="#747B91" />
            <TextInput
              accessibilityLabel="Confirmar contraseña"
              style={styles.input}
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder="Repetí tu contraseña"
              placeholderTextColor="#81889D"
              secureTextEntry={!visible}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!busy}
              onSubmitEditing={() => void submit()}
            />
          </View>
        </View>
      )}
      <View style={{ marginTop: 16 }}>
        {error && <Text accessibilityRole="alert" style={authStyles.error}>{error}</Text>}
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => void submit()} style={[authStyles.button, busy && { opacity: 0.55 }]}>
          {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={authStyles.buttonText}>{creating ? "Crear mi comercio" : "Iniciar sesión"}</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 15, fontWeight: "700", color: "#090E18", marginBottom: 7 },
  inputRow: { minHeight: 46, borderRadius: 10, borderWidth: 1, borderColor: "#D7DAE5", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 10, backgroundColor: "#FDFDFE" },
  input: { flex: 1, minWidth: 0, fontSize: 15, color: "#090E18", paddingVertical: 11 },
  hint: { color: "#81889D", fontSize: 12, lineHeight: 17, marginTop: 6, marginBottom: 14 },
});
