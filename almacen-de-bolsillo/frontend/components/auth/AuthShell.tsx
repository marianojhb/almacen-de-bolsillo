import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function AuthShell({ children }: { children: ReactNode }) {
  const compact = useWindowDimensions().height < 740;
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <View style={[styles.brand, compact && { marginBottom: 12, gap: 4 }]}>
              <View style={[styles.logo, compact && { width: 48, height: 48, borderRadius: 14 }]}><Ionicons name="storefront-outline" size={compact ? 30 : 38} color="#ffffff" /></View>
              <Text style={[styles.brandTitle, compact && { fontSize: 24 }]}>Almacén de Bolsillo</Text>
              <Text style={styles.subtitle}>Tu comercio, organizado en un solo lugar.</Text>
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const authStyles = StyleSheet.create({
  card: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#E5EBF0", borderRadius: 18, padding: 18, marginBottom: 12, boxShadow: "0px 6px 28px rgba(30, 55, 65, 0.05)" },
  title: { fontSize: 25, fontWeight: "800", color: "#090E18", marginBottom: 16 },
  description: { color: "#747B91", fontSize: 13, lineHeight: 18 },
  button: { minHeight: 48, borderRadius: 12, backgroundColor: "#1C2B28", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, paddingHorizontal: 12 },
  buttonText: { color: "#ffffff", fontSize: 17, fontWeight: "700" },
  error: { color: "#B42318", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  link: { color: "#1C2B28", fontSize: 15, fontWeight: "600", textAlign: "center", paddingVertical: 14 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FCFDFE" },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 16, paddingVertical: 10 },
  content: { width: "100%", maxWidth: 560, alignSelf: "center" },
  brand: { alignItems: "center", marginBottom: 18, gap: 6 },
  logo: { width: 64, height: 64, borderRadius: 18, backgroundColor: "#1C2B28", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  brandTitle: { color: "#090E18", fontSize: 27, fontWeight: "800", textAlign: "center", letterSpacing: -0.8 },
  subtitle: { color: "#747B91", fontSize: 13, lineHeight: 18, textAlign: "center" },
});
