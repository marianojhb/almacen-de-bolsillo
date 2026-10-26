import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { StyleSheet, Text, View, useColorScheme, useWindowDimensions } from "react-native";
import { notebook, notebookFonts } from "@/constants/notebook";

export function NotebookPaper({ appearance }: { appearance?: "light" | "dark" } = {}) {
  const { height } = useWindowDimensions();
  const systemAppearance = useColorScheme();
  const palette = (appearance ?? systemAppearance) === "dark" ? notebook.dark : notebook;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }, { backgroundColor: palette.paper }]}>
      {Array.from({ length: Math.ceil(height / 32) }, (_, index) => (
        <View key={index} style={{ position: "absolute", top: index * 32 + 31, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: palette.rule, opacity: 0.55 }} />
      ))}
      <View style={{ position: "absolute", top: 0, bottom: 0, left: 12, width: StyleSheet.hairlineWidth, backgroundColor: palette.pencil, opacity: 0.65 }} />
    </View>
  );
}

export function NotebookHeading({ children, subtitle }: { children: ReactNode; subtitle?: ReactNode }) {
  return (
    <View className="mb-4 pt-1">
      <Text accessibilityRole="header" className="font-handwriting text-[38px] leading-[46px] text-ink dark:text-white">{children}</Text>
      <View className="mb-2 mt-1 h-[2px] w-36 rounded-full bg-pencil" style={{ transform: [{ rotate: "-1deg" }] }} />
      {subtitle ? <Text className="mt-1 text-sm leading-5 text-slate-700 dark:text-slate-300">{subtitle}</Text> : null}
    </View>
  );
}

export function NotebookScene({ children }: { children: ReactNode }) {
  const palette = useColorScheme() === "dark" ? notebook.dark : notebook;
  return (
    <View style={{ flex: 1, backgroundColor: palette.paper }}>
      <NotebookPaper />
      {children}
    </View>
  );
}

export function NotebookBrand() {
  const palette = useColorScheme() === "dark" ? notebook.dark : notebook;
  return (
    <View accessible accessibilityLabel="Almacén de Bolsillo" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Ionicons name="storefront-outline" size={28} color={palette.ink} />
      <View>
        <Text style={{ color: palette.ink, fontSize: 16, fontWeight: "800" }}>Almacén de Bolsillo</Text>
        <View style={{ marginTop: 3, height: 2, width: 32, backgroundColor: palette.pencil, borderRadius: 2 }} />
      </View>
    </View>
  );
}

export function useNotebookHeader() {
  const palette = useColorScheme() === "dark" ? notebook.dark : notebook;
  return {
    headerStyle: { backgroundColor: palette.paper },
    headerTintColor: palette.ink,
    headerTitleStyle: { fontFamily: notebookFonts.handwriting, fontSize: 27, fontWeight: "400" as const },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: palette.paper },
  };
}
