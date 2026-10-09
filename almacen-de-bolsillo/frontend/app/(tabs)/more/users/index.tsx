import { useCallback, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { useAuth } from "@/contexts/auth";
import { useUsers } from "@/contexts/users";
import { UserCard } from "@/components/users/UserCard";
import { AuthButton } from "@/components/auth/AuthButton";
import { useRoles } from "@/contexts/roles";

export default function UsersScreen() {
  const { session } = useAuth();
  const { users, isLoadingUsers, usersError, refreshUsers } = useUsers();
  const { roles } = useRoles();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try { await refreshUsers(); } finally { setIsRefreshing(false); }
  };
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"active" | "inactive" | "all">("active");
  const canCreate = (session?.permissions.includes("users.manage") ?? false) && (session?.permissions.includes("roles.read") ?? false);

  useFocusEffect(useCallback(() => { void refreshUsers(); }, [refreshUsers]));

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((item) => {
      const matchesStatus = filter === "all" || (filter === "active" ? item.isActive : !item.isActive);
      const searchable = [item.name, item.username, item.email, item.isOwner ? "Creador del comercio" : roles.find((role) => role.id === item.commerceRole.id)?.name ?? item.commerceRole.name, item.employee?.name];
      return matchesStatus && (!query || searchable.some((value) => value?.toLowerCase().includes(query)));
    });
  }, [users, search, filter, roles]);

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4 dark:bg-black">
      <View className="mb-4 flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-3xl font-bold text-gray-950 dark:text-white">Usuarios</Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">{visibleUsers.length} visibles</Text>
        </View>
        {canCreate && (
          <Link href="/more/users/new" asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Crear usuario"
              className="flex-row items-center gap-2 rounded-xl bg-[#111A1A] px-4 py-3 dark:bg-white">
              <Ionicons name="add" size={20} color="#9ca3af" />
              <Text className="font-semibold text-white dark:text-black">Nuevo</Text>
            </Pressable>
          </Link>
        )}
      </View>
      <TextInput value={search} onChangeText={setSearch} placeholder="Buscar usuario, correo, rol o empleado"
        accessibilityLabel="Buscar usuarios" placeholderTextColor="#9ca3af"
        className="mb-3 h-12 rounded-xl border border-gray-300 bg-white px-3 text-base text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
      <View className="mb-4 flex-row gap-2">
        {(["active", "inactive", "all"] as const).map((value) => (
          <Pressable key={value} onPress={() => setFilter(value)} accessibilityRole="button"
            accessibilityState={{ selected: filter === value }}
            className={`flex-1 items-center rounded-xl border py-3 ${filter === value
              ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
              : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"}`}>
            <Text className={`text-sm font-semibold ${filter === value ? "text-white dark:text-black" : "text-gray-700 dark:text-gray-200"}`}>
              {value === "active" ? "Activos" : value === "inactive" ? "Inactivos" : "Todos"}
            </Text>
          </Pressable>
        ))}
      </View>
      {usersError && (
        <View className="mb-4 gap-3 rounded-xl border border-red-300 bg-red-50 p-4 dark:bg-red-950">
          <Text className="text-red-700 dark:text-red-300">{usersError}</Text>
          <AuthButton label="Reintentar" secondary onPress={() => void refreshUsers()} />
        </View>
      )}
      <FlatList className="flex-1" data={visibleUsers} keyExtractor={(item) => item.id.toString()} contentContainerClassName="gap-3 pb-8"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void handleRefresh()} />}
        ListEmptyComponent={isLoadingUsers ? (
          <View className="items-center gap-3 py-8">
            <ActivityIndicator size="large" color="#9ca3af" />
            <Text className="text-gray-500 dark:text-gray-400">Cargando usuarios...</Text>
          </View>
        ) : !usersError ? (
          <View className="items-center py-16">
            <Ionicons name="people-outline" size={48} color="#9ca3af" />
            <Text className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-300">No se encontraron usuarios</Text>
          </View>
        ) : null}
        renderItem={({ item }) => <UserCard user={item} />} />
    </View>
  );
}
