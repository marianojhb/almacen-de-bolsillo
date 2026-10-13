import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { AuthShell, authStyles } from "@/components/auth/AuthShell";
import { CredentialsForm } from "@/components/auth/CredentialsForm";
import { useAuth } from "@/contexts/AuthContext";
import { getSetupStatusRequest } from "@/services/authApi";

export default function CreateOwnerScreen() {
  const { createOwner } = useAuth();
  const [ownerExists, setOwnerExists] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    getSetupStatusRequest().then((status) => { if (active) setOwnerExists(status.ownerExists); }).catch((failure: unknown) => {
      if (active) setError(failure instanceof Error ? failure.message : "No se pudo consultar el comercio.");
    });
    return () => { active = false; };
  }, [retry]);

  return (
    <AuthShell>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>Crear mi comercio</Text>
        <Text style={[authStyles.description, { marginBottom: 22 }]}>Creá la cuenta del dueño para empezar a usar Almacén de Bolsillo.</Text>
        {ownerExists === true ? <Text style={authStyles.description}>El comercio ya tiene un dueño registrado. Iniciá sesión con tu cuenta.</Text> : (
          <>
            {ownerExists === null && !error && <ActivityIndicator style={{ marginBottom: 16 }} color="#1C2B28" />}
            {error && <Text style={authStyles.error}>{error}</Text>}
            <CredentialsForm mode="create-owner" onSubmit={createOwner} disabled={ownerExists !== false} />
            {error && <Pressable accessibilityRole="button" onPress={() => { setError(null); setOwnerExists(null); setRetry((value) => value + 1); }}><Text style={authStyles.link}>Reintentar</Text></Pressable>}
          </>
        )}
        <Pressable accessibilityRole="button" onPress={() => router.replace("/login" as Href)}><Text style={authStyles.link}>Volver a iniciar sesión</Text></Pressable>
      </View>
    </AuthShell>
  );
}
