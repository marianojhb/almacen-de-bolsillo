import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { AuthShell, authStyles } from "@/components/auth/AuthShell";
import { CredentialsForm } from "@/components/auth/CredentialsForm";
import { useAuth } from "@/contexts/AuthContext";
import { getSetupStatusRequest } from "@/services/authApi";
import { notebook } from "@/constants/notebook";

export default function LoginScreen() {
  const compact = useWindowDimensions().height < 740;
  const { login } = useAuth();
  const [ownerExists, setOwnerExists] = useState<boolean | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    getSetupStatusRequest().then((status) => {
      if (active) setOwnerExists(status.ownerExists);
    }).catch((error: unknown) => {
      if (active) setSetupError(error instanceof Error ? error.message : "No se pudo consultar el comercio.");
    });
    return () => { active = false; };
  }, [retry]);

  return (
    <AuthShell animateStartupLogo>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>Iniciar sesión</Text>
        <CredentialsForm mode="login" onSubmit={login} />
      </View>
      <View style={[authStyles.card, styles.setupCard, compact && { padding: 12, gap: 10 }]}>
        <View style={[styles.illustration, compact && { width: 40, height: 70 }]}>
          <View style={styles.blob} />
          <Ionicons name="storefront-outline" size={compact ? 34 : 46} color="#1C2B28" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.setupTitle}>¿Querés empezar a ordenar tu negocio?</Text>
          <Text style={[authStyles.description, { marginTop: 5, marginBottom: 10 }]}>
            Creá tu comercio y empezá a controlar ventas, stock y movimientos desde un solo lugar.
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={ownerExists !== false}
            onPress={() => router.push("/create-owner" as Href)}
            style={[authStyles.button, { minHeight: 44 }, ownerExists !== false && { opacity: 0.5 }]}
          >
            {ownerExists === null && !setupError ? <ActivityIndicator color="#ffffff" /> : (
              <>
                <Text style={[authStyles.buttonText, { fontSize: 14 }]}>{ownerExists ? "Comercio ya configurado" : "Crear mi comercio"}</Text>
                {!ownerExists && <Ionicons name="arrow-forward" color="#ffffff" size={21} />}
              </>
            )}
          </Pressable>
        </View>
      </View>
      {setupError && (
        <View>
          <Text style={authStyles.error}>{setupError}</Text>
          <Pressable accessibilityRole="button" onPress={() => { setOwnerExists(null); setSetupError(null); setRetry((value) => value + 1); }}><Text style={authStyles.link}>Volver a consultar</Text></Pressable>
        </View>
      )}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  setupCard: { backgroundColor: notebook.surface, flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  illustration: { width: 56, height: 80, alignItems: "center", justifyContent: "center" },
  blob: { position: "absolute", width: "100%", height: "100%", borderRadius: 10, backgroundColor: notebook.selected, transform: [{ rotate: "-8deg" }] },
  setupTitle: { fontSize: 16, fontWeight: "800", color: notebook.ink, lineHeight: 20 },
});
