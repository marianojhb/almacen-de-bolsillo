import { normalizePermissions, permissionOptions } from "@almacen/shared";
import { useRef, useState } from "react";
import type { CommerceRoleDto } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { useAuth } from "@/contexts/auth";
import { useRoles } from "@/contexts/roles";
import { DeleteRecordButton } from "@/components/DeleteRecordButton";

export function RoleCard({ role }: { role: CommerceRoleDto }) {
  const { session } = useAuth();
  const { updateRole, deleteRole } = useRoles();
  const [expanded, setExpanded] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const busy = useRef(false);
  const canManage = session?.permissions.includes("roles.manage") ?? false;
  const isCurrentRole = role.id === session?.role.id;
  const codes = normalizePermissions(role.permissions.map((item) => item.permission.code));
  const functions = permissionOptions.filter((option) => option.codes.some((code) => codes.includes(code)));

  const changeStatus = () => {
    if (busy.current || isChanging || !canManage || isCurrentRole) return;
    busy.current = true;
    setIsChanging(true);
    const finish = () => { busy.current = false; setIsChanging(false); };
    Alert.alert(
      role.isActive ? "Desactivar rol" : "Reactivar rol",
      role.isActive
        ? `Los usuarios con el rol ${role.name} no podrán acceder mientras esté inactivo. ¿Continuar?`
        : `¿Querés reactivar el rol ${role.name}?`,
      [
        { text: "Cancelar", style: "cancel", onPress: finish },
        { text: role.isActive ? "Desactivar" : "Reactivar", style: role.isActive ? "destructive" : "default", onPress: () => {
          void updateRole(role.id, { isActive: !role.isActive }).catch((error) => {
            Alert.alert("No se pudo cambiar el rol", error instanceof Error ? error.message : "Intentá nuevamente.");
          }).finally(finish);
        } },
      ],
      { cancelable: false },
    );
  };

  return (
    <View className={`rounded-2xl border p-4 ${role.isActive
      ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      : "border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800"}`}>
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-950 dark:text-white">{role.name}</Text>
          {!!role.description && <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">{role.description}</Text>}
        </View>
        <Text className={`text-xs font-semibold ${role.isActive ? "text-green-700 dark:text-green-300" : "text-gray-500 dark:text-gray-400"}`}>
          {role.isActive ? "Activo" : "Inactivo"}
        </Text>
      </View>
      <Pressable onPress={() => setExpanded((value) => !value)} accessibilityRole="button"
        accessibilityState={{ expanded }} accessibilityLabel={`Consultar permisos del rol ${role.name}`}
        className="mt-3 flex-row items-center justify-between py-2">
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">{functions.length} funciones</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#9ca3af" />
      </Pressable>
      {expanded && (
        <View className="gap-2 border-t border-gray-200 py-3 dark:border-gray-700">
          {functions.map((option) => <Text key={option.id} className="text-sm text-gray-600 dark:text-gray-300">
            • {option.label}{option.codes.every((code) => codes.includes(code)) ? "" : " (acceso parcial)"}
          </Text>)}
          {!role.permissions.length && <Text className="text-sm text-gray-500 dark:text-gray-400">Este rol no tiene permisos asignados.</Text>}
        </View>
      )}
      {isCurrentRole && <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Es el rol de tu sesión. Su edición y desactivación no están disponibles desde estas pantallas.
      </Text>}
      {canManage && !isCurrentRole && (
        <View className="mt-3 flex-row gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
          <Link href={{ pathname: "/more/roles/[id]/edit", params: { id: role.id } }} asChild>
            <Pressable disabled={isChanging} accessibilityRole="button" accessibilityLabel={`Editar rol ${role.name}`}
              className="flex-row items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 dark:bg-gray-800">
              <Ionicons name="create-outline" size={20} color="#9ca3af" />
              <Text className="font-semibold text-gray-700 dark:text-gray-200">Editar</Text>
            </Pressable>
          </Link>
          <Pressable disabled={isChanging} onPress={changeStatus} accessibilityRole="button"
            className="flex-1 items-center justify-center rounded-xl border border-gray-300 px-3 py-2 dark:border-gray-600">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {isChanging ? "Procesando..." : role.isActive ? "Desactivar" : "Reactivar"}
            </Text>
          </Pressable>
        </View>
      )}
      {canManage && !isCurrentRole && (
        <DeleteRecordButton name={role.name} disabled={isChanging} onBusyChange={setIsChanging}
          description="El rol solo se puede eliminar si no tiene usuarios asignados, ni siquiera inactivos. Primero cambiá sus usuarios a otro rol."
          onDelete={() => deleteRole(role.id)} />
      )}
    </View>
  );
}
