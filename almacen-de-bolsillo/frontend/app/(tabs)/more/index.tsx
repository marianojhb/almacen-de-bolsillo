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
import { NotebookHeading } from "@/components/ui/notebook";
import { ThemeSelector } from "@/components/settings/ThemeSelector";

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
    <View className="flex-1 bg-transparent px-6 pt-5">
      <NotebookHeading subtitle="Todo para llevar tu negocio al día">Mi almacén</NotebookHeading>

      <FlatList
        data={options}
        ListHeaderComponent={<ThemeSelector />}
        ListFooterComponent={
          <Link href="/more/account" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir mi cuenta"
               className="mb-8 mt-3 flex-row items-center border-b border-gray-200 py-4 active:opacity-60 dark:border-gray-700">
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
            <Pressable className="flex-row items-center border-b border-gray-200 py-4 active:opacity-60 dark:border-gray-700">
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
