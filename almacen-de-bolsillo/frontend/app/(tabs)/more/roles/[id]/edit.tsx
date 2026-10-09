import { router, useLocalSearchParams } from "expo-router";
import { Alert, Text, View } from "react-native";
import { RoleForm } from "@/components/roles/form/RoleForm";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/contexts/auth";
import { useRoles } from "@/contexts/roles";

export default function EditRoleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { roles, isLoadingRoles, rolesError, refreshRoles, updateRole } = useRoles();
  const roleId = Number(id);
  const role = roles.find((item) => item.id === roleId);

  if (roleId === session?.role.id) return (
    <View className="flex-1 gap-4 bg-gray-50 p-4 dark:bg-black">
      <Text className="text-gray-700 dark:text-gray-300">No podés editar el rol de tu sesión desde esta pantalla.</Text>
      <AuthButton label="Volver" secondary onPress={() => router.back()} />
    </View>
  );
  if (isLoadingRoles) return (
    <View className="flex-1 bg-gray-50 p-4 dark:bg-black"><Text className="text-gray-600 dark:text-gray-300">Cargando rol...</Text></View>
  );
  if (!Number.isSafeInteger(roleId) || roleId <= 0 || rolesError || !role) return (
    <View className="flex-1 gap-4 bg-gray-50 p-4 dark:bg-black">
      <Text className="text-red-600 dark:text-red-400">{rolesError ?? "Rol no encontrado en este comercio."}</Text>
      {!!rolesError && <AuthButton label="Reintentar" secondary onPress={() => void refreshRoles()} />}
      <AuthButton label="Volver" secondary onPress={() => router.back()} />
    </View>
  );
  return (
    <RoleForm key={role.id} role={role} onCancel={() => router.back()} onSubmit={async (data) => {
      await updateRole(role.id, data);
      router.replace("/more/roles");
      Alert.alert("Rol actualizado", "Los cambios se guardaron. Las nuevas solicitudes al backend usarán estos permisos.");
    }} />
  );
}
