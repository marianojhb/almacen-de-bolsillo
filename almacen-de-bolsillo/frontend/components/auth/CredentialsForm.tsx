import { formatFullName, type CreateOwnerDto, type EmployeeGender, type LoginDto } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { authStyles } from "./AuthShell";

type Props = ({
  mode: "login";
  onSubmit: (credentials: LoginDto) => Promise<void>;
} | {
  mode: "create-owner";
  onSubmit: (credentials: CreateOwnerDto) => Promise<void>;
}) & {
  disabled?: boolean;
};

const genders: { value: EmployeeGender; label: string }[] = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "OTHER", label: "Otro" },
];

export function CredentialsForm({ mode, onSubmit, disabled = false }: Props) {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [dni, setDni] = useState("");
  const [gender, setGender] = useState<EmployeeGender | null>(null);
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
    if (creating && (!firstname.trim() || !lastname.trim())) {
      setError("Ingresá el nombre y apellido del creador.");
      return;
    }
    const normalizedDni = dni.replace(/[.\s]/g, "");
    if (creating && !/^\d{7,8}$/.test(normalizedDni)) {
      setError("Ingresá un DNI válido de 7 u 8 dígitos.");
      return;
    }
    if (creating && !gender) {
      setError("Seleccioná el género del creador.");
      return;
    }
    try {
      setIsSubmitting(true);
      if (mode === "create-owner") {
        await onSubmit({ email: normalizedEmail, password, firstname: firstname.trim(), lastname: lastname.trim(), dni: normalizedDni, gender: gender! });
      } else {
        await onSubmit({ email: normalizedEmail, password });
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo completar la operación.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View>
      {creating && <View style={{ gap: 14, marginBottom: 20 }}>
        <View>
          <Text style={styles.label}>Nombre</Text>
          <View style={styles.inputRow}><TextInput accessibilityLabel="Nombre del creador" style={styles.input} value={firstname} onChangeText={setFirstname} placeholder="Tu nombre" placeholderTextColor="#81889D" autoCapitalize="words" maxLength={100} editable={!busy} /></View>
        </View>
        <View>
          <Text style={styles.label}>Apellido</Text>
          <View style={styles.inputRow}><TextInput accessibilityLabel="Apellido del creador" style={styles.input} value={lastname} onChangeText={setLastname} placeholder="Tu apellido" placeholderTextColor="#81889D" autoCapitalize="words" maxLength={100} editable={!busy} /></View>
        </View>
        {(firstname.trim() || lastname.trim()) && <Text style={styles.hint}>Nombre completo: {formatFullName(firstname, lastname)}</Text>}
        <View>
          <Text style={styles.label}>DNI</Text>
          <View style={styles.inputRow}><TextInput accessibilityLabel="DNI del creador" style={styles.input} value={dni} onChangeText={setDni} placeholder="Sin puntos" placeholderTextColor="#81889D" keyboardType="number-pad" maxLength={10} editable={!busy} /></View>
        </View>
        <View>
          <Text style={styles.label}>Género</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {genders.map((item) => <Pressable key={item.value} accessibilityRole="radio" accessibilityState={{ checked: gender === item.value, disabled: busy }} disabled={busy} onPress={() => setGender(item.value)} style={{ borderRadius: 10, borderWidth: 1, borderColor: "#D7DAE5", backgroundColor: gender === item.value ? "#1C2B28" : "#FDFDFE", padding: 12 }}><Text style={{ color: gender === item.value ? "white" : "#090E18", fontWeight: "600" }}>{item.label}</Text></Pressable>)}
          </View>
        </View>
      </View>}
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
