import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import logoImage from "@/assets/images/almacen-de-bolsillo-magick.png";
import { StartupLogo } from "@/components/auth/StartupLogo";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { NotebookPaper } from "@/components/ui/notebook";
import { notebook, notebookFonts } from "@/constants/notebook";

export function AuthShell({ children, animateStartupLogo = false }: { children: ReactNode; animateStartupLogo?: boolean }) {
  const compact = useWindowDimensions().height < 740;
  return (
    <SafeAreaView style={styles.safe}>
      <NotebookPaper appearance="light" />
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <View style={[styles.brand, compact && styles.compactBrand]}>
              <View style={[styles.logo, compact && styles.compactLogo]}>
                {animateStartupLogo ? (
                  <StartupLogo
                    targetRadius={compact ? 14 : 18}
                    targetSize={compact ? 48 : 64}
                  />
                ) : (
                  <OptimizedImage
                    accessibilityLabel="Logo de Almacén de Bolsillo"
                    cachePolicy="memory-disk"
                    contentFit="cover"
                    priority="high"
                    source={logoImage}
                    style={[styles.logoImage, compact && styles.compactLogoImage]}
                  />
                )}
              </View>
              <Text style={[styles.brandTitle, compact && styles.compactBrandTitle]}>Almacén de Bolsillo</Text>
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
  card: { backgroundColor: notebook.surface, borderWidth: 1, borderColor: notebook.border, borderRadius: 12, padding: 18, marginBottom: 12 },
  title: { fontFamily: notebookFonts.handwriting, fontSize: 34, color: notebook.ink, marginBottom: 16 },
  description: { color: notebook.muted, fontSize: 13, lineHeight: 18 },
  button: { minHeight: 48, borderRadius: 10, backgroundColor: notebook.ink, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, paddingHorizontal: 12 },
  buttonText: { color: notebook.surface, fontSize: 17, fontWeight: "700" },
  error: { color: "#913727", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  link: { color: notebook.ink, fontSize: 15, fontWeight: "600", textAlign: "center", paddingVertical: 14 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: notebook.paper },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 16, paddingVertical: 10 },
  content: { width: "100%", maxWidth: 560, alignSelf: "center" },
  brand: { alignItems: "center", marginBottom: 18, gap: 6 },
  compactBrand: { marginBottom: 12, gap: 4 },
  logo: { width: 64, height: 64, borderRadius: 18, borderCurve: "continuous", alignItems: "center", justifyContent: "center", marginBottom: 4, overflow: "hidden" },
  compactLogo: { width: 48, height: 48, borderRadius: 14 },
  logoImage: { width: 64, height: 64 },
  compactLogoImage: { width: 48, height: 48 },
  brandTitle: { color: notebook.ink, fontSize: 27, fontWeight: "800", textAlign: "center", letterSpacing: -0.8 },
  compactBrandTitle: { fontSize: 24 },
  subtitle: { color: notebook.muted, fontSize: 13, lineHeight: 18, textAlign: "center" },
});
