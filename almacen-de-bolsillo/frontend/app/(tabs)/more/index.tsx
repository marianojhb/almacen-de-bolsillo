import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import { MORE_OPTIONS } from "@/constants/more-options";
import { useAuth } from "@/contexts/auth";
import { AuthButton } from "@/components/auth/AuthButton";

export default function MoreScreen() {
  const { session, signOut, refreshSession } = useAuth();
  useFocusEffect(useCallback(() => { void refreshSession(); }, [refreshSession]));
  const visibleOptions = MORE_OPTIONS.filter((option) =>
    session?.permissions.includes(option.permission) && (!option.ownerOnly || session.isOwner),
  );
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setLogoutError(null);
    try {
      await signOut();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "No se pudo cerrar la sesión.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-5 dark:bg-black">
      <Text className="mb-6 text-base text-gray-500 dark:text-gray-400">
        Gestión y configuración
      </Text>

      <FlatList
        data={visibleOptions}
        keyExtractor={(item) =>
          item.id
        }
        contentContainerClassName="gap-3"
        ListHeaderComponent={
          <View className="mb-3 gap-1 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <Text className="text-lg font-bold text-gray-950 dark:text-white">{session?.commerce.name}</Text>
            <Text className="text-gray-600 dark:text-gray-300">{session?.user.name}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">{session?.isOwner ? "Creador del comercio" : session?.role.name}</Text>
            {session?.employee && <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">Empleado: {session.employee.name}</Text>}
            {session?.isOwner === false && session.employee === null && (
              <View className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
                <Text className="font-semibold text-amber-950 dark:text-amber-100">Sin empleado vinculado</Text>
                <Text className="mt-1 text-sm text-amber-900 dark:text-amber-200">El administrador puede vincular tu cuenta desde Usuarios. Este aviso no cambia tus permisos.</Text>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View className="gap-3 py-5">
            {logoutError && <Text accessibilityRole="alert" className="text-sm text-red-600 dark:text-red-400">{logoutError}</Text>}
            <AuthButton label={isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
              secondary loading={isSigningOut} onPress={() => void handleSignOut()} />
          </View>
        }
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
