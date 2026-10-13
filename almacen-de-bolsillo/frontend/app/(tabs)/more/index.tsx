import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import {
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import { MORE_OPTIONS } from "@/constants/more-options";
import { formatFullName, ROLE_LABELS } from "@almacen/shared";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

export default function MoreScreen() {
  const { user, logout } = useAuth();
  const { can, hasFullAccess } = usePermissions();
  const profile = user?.employee;
  const fullname = formatFullName(profile?.firstname, profile?.lastname);
  const options = MORE_OPTIONS.filter((option) => {
    if (option.id === "suppliers") return can("suppliers", "read");
    if (option.id === "employees") return can("employees", "read");
    if (option.id === "work-shifts") return can("workShifts", "read");
    return hasFullAccess;
  });
  return (
    <View className="flex-1 bg-gray-50 px-4 pt-5 dark:bg-black">
      <Text className="mb-6 text-base text-gray-500 dark:text-gray-400">
        Gestión y configuración
      </Text>

      <FlatList
        data={options}
        ListHeaderComponent={
          <View className="mb-4 gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <Text className="text-lg font-semibold text-gray-950 dark:text-white">Mi cuenta</Text>
            <Text className="text-xl font-semibold text-gray-950 dark:text-white">{fullname || "Nombre no registrado"}</Text>
            <View className="flex-row gap-4">
              {[["Nombre", profile?.firstname], ["Apellido", profile?.lastname]].map(([label, value]) => (
                <View key={label} className="flex-1 gap-1">
                  <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</Text>
                  <Text className="text-base text-gray-800 dark:text-gray-200">{value || "No registrado"}</Text>
                </View>
              ))}
            </View>
            {[
              ["DNI", profile?.dni],
              ["Email", user?.email],
              ["Rol", user ? ROLE_LABELS[user.role] : null],
            ].map(([label, value]) => <View key={label} className="gap-1">
              <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</Text>
              <Text className="text-base text-gray-800 dark:text-gray-200">{value || "No registrado"}</Text>
            </View>)}
            <Pressable accessibilityRole="button" onPress={logout} className="flex-row items-center justify-center gap-2 rounded-xl bg-[#111A1A] p-3 active:opacity-70 dark:bg-white">
              <Ionicons name="log-out-outline" size={20} color="#80938A" />
              <Text className="font-semibold text-white dark:text-black">Cerrar sesión</Text>
            </Pressable>
          </View>
        }
        keyExtractor={(item) =>
          item.id
        }
        contentContainerClassName="gap-3"
        renderItem={({ item }) => (
          <Link
            href={item.href}
            asChild
          >
            <Pressable className="flex-row items-center rounded-2xl border border-gray-200 bg-white p-4 active:opacity-60 dark:border-gray-700 dark:bg-gray-900">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                <Ionicons
                  name={item.icon}
                  size={25}
                  color="#687076"
                />
              </View>

              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-950 dark:text-white">
                  {item.title}
                </Text>

                <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={22}
                color="#9ca3af"
              />
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
