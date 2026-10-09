import { useCallback, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { useAuth } from "@/contexts/auth";
import { useRoles } from "@/contexts/roles";
import { RoleCard } from "@/components/roles/RoleCard";
import { AuthButton } from "@/components/auth/AuthButton";

export default function RolesScreen() {
  const { session } = useAuth();
  const { roles, isLoadingRoles, rolesError, refreshRoles } = useRoles();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try { await refreshRoles(); } finally { setIsRefreshing(false); }
  };
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"active" | "inactive" | "all">("active");
  const canCreate = (session?.permissions.includes("roles.manage") ?? false);

  useFocusEffect(useCallback(() => { void refreshRoles(); }, [refreshRoles]));

  const visibleRoles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return roles.filter((item) => {
      const matchesStatus = filter === "all" || (filter === "active" ? item.isActive : !item.isActive);
      const searchable = [item.name, item.description];
      return matchesStatus && (!query || searchable.some((value) => value?.toLowerCase().includes(query)));
    });
  }, [roles, search, filter]);

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4 dark:bg-black">
      <View className="mb-4 flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-3xl font-bold text-gray-950 dark:text-white">Roles y permisos</Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">{visibleRoles.length} visibles</Text>
        </View>
        {canCreate && (
          <Link href="/more/roles/new" asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Crear rol"
              className="flex-row items-center gap-2 rounded-xl bg-[#111A1A] px-4 py-3 dark:bg-white">
              <Ionicons name="add" size={20} color="#9ca3af" />
              <Text className="font-semibold text-white dark:text-black">Nuevo</Text>
            </Pressable>
          </Link>
        )}
      </View>
      <TextInput value={search} onChangeText={setSearch} placeholder="Buscar rol"
        accessibilityLabel="Buscar roles" placeholderTextColor="#9ca3af"
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
      {rolesError && (
        <View className="mb-4 gap-3 rounded-xl border border-red-300 bg-red-50 p-4 dark:bg-red-950">
          <Text className="text-red-700 dark:text-red-300">{rolesError}</Text>
          <AuthButton label="Reintentar" secondary onPress={() => void refreshRoles()} />
        </View>
      )}
      <FlatList className="flex-1" data={visibleRoles} keyExtractor={(item) => item.id.toString()} contentContainerClassName="gap-3 pb-8"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void handleRefresh()} />}
        ListEmptyComponent={isLoadingRoles ? (
          <View className="items-center gap-3 py-8">
            <ActivityIndicator size="large" color="#9ca3af" />
            <Text className="text-gray-500 dark:text-gray-400">Cargando roles...</Text>
          </View>
        ) : !rolesError ? (
          <View className="items-center py-16">
            <Ionicons name="shield-checkmark-outline" size={48} color="#9ca3af" />
            <Text className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-300">No se encontraron roles</Text>
          </View>
        ) : null}
        renderItem={({ item }) => <RoleCard role={item} />} />
    </View>
  );
}
