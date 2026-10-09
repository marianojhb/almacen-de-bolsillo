import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/auth";

export function EmployeeLinkNotice() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const shownUsers = useRef(new Set<number>());
  const [visible, setVisible] = useState(false);
  const userId = session?.user.id;
  const needsEmployee = session?.isOwner === false && session.employee === null;

  useEffect(() => {
    if (!needsEmployee || userId === undefined || shownUsers.current.has(userId)) return;
    shownUsers.current.add(userId);
    setVisible(true);
  }, [userId, needsEmployee]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible || !needsEmployee) return null;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", bottom: 60 + insets.bottom, left: 12, right: 12 }}>
      <View className="flex-row items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <Ionicons name="information-circle-outline" size={24} color="#b45309" />
        <View className="flex-1">
          <Text className="font-semibold text-amber-950 dark:text-amber-100">Sin empleado vinculado</Text>
          <Text className="mt-1 text-sm text-amber-900 dark:text-amber-200">Tu cuenta no tiene una ficha de empleado. Podés seguir usando la app; el administrador puede vincularla desde Usuarios.</Text>
        </View>
        <Pressable onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Cerrar aviso" hitSlop={10}>
          <Ionicons name="close" size={22} color="#b45309" />
        </Pressable>
      </View>
    </View>
  );
}
