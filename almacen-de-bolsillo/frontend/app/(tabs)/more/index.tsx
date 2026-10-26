import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import {
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import { MORE_OPTIONS } from "@/constants/more-options";
import { formatFullName } from "@almacen/shared";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

export default function MoreScreen() {
  const { user } = useAuth();
  const { can, hasFullAccess } = usePermissions();
  const profile = user?.employee;
  const fullname = formatFullName(profile?.firstname, profile?.lastname);
  const options = MORE_OPTIONS.filter((option) => {
    if (option.id === "cash-closing") return true;
    if (option.id === "suppliers") return can("suppliers", "read");
    if (option.id === "employees") return can("employees", "read");
    if (option.id === "work-shifts") return can("workShifts", "read");
    return hasFullAccess;
  });
  return (
    <View className="flex-1 bg-gray-50 px-4 pt-5 dark:bg-black">
      <Text className="mb-6 text-base text-gray-500 dark:text-gray-400">
        Gestión del negocio
      </Text>

      <FlatList
        data={options}
        ListFooterComponent={
          <Link href="/more/account" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir mi cuenta"
              className="mb-8 mt-3 flex-row items-center rounded-2xl border border-gray-200 bg-white p-4 active:opacity-60 dark:border-gray-700 dark:bg-gray-900">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                <Ionicons name="person-circle-outline" size={27} color="#687076" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-950 dark:text-white">Mi cuenta</Text>
                <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
                  {fullname || user?.email || "Cuenta activa"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
            </Pressable>
          </Link>
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
