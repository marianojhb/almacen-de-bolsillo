import { Ionicons } from "@expo/vector-icons";
import { formatFullName, ROLE_LABELS } from "@almacen/shared";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";

type AccountDetailProps = {
  label: string;
  value: string | null | undefined;
};

function AccountDetail({ label, value }: AccountDetailProps) {
  return (
    <View className="gap-1 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
      <Text className="text-xs font-bold uppercase tracking-[1.2px] text-slate-400">
        {label}
      </Text>
      <Text className="text-base font-medium text-slate-900 dark:text-slate-100">
        {value || "No registrado"}
      </Text>
    </View>
  );
}

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const profile = user?.employee;
  const fullname = formatFullName(profile?.firstname, profile?.lastname);
  const role = user ? ROLE_LABELS[user.role] : null;

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerClassName="gap-4 px-4 pb-8 pt-4"
      showsVerticalScrollIndicator={false}>
      <View className="items-center rounded-2xl bg-ink px-5 py-7 dark:bg-slate-950">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15">
          <Ionicons name="person-outline" size={38} color="#6ee7b7" />
        </View>
        <Text className="mt-4 text-center text-2xl font-black text-white">
          {fullname || "Nombre no registrado"}
        </Text>
        <Text className="mt-1 text-sm font-semibold text-emerald-300">
          {role || "Rol no registrado"}
        </Text>
      </View>

      <View className="rounded-3xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-950">
        <AccountDetail label="Nombre" value={profile?.firstname} />
        <AccountDetail label="Apellido" value={profile?.lastname} />
        <AccountDetail label="DNI" value={profile?.dni} />
        <AccountDetail label="Email" value={user?.email} />
        <AccountDetail label="Rol" value={role} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        onPress={logout}
        className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#111A1A] p-4 active:opacity-70 dark:bg-white">
        <Ionicons name="log-out-outline" size={21} color="#80938A" />
        <Text className="font-black text-white dark:text-black">Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}
