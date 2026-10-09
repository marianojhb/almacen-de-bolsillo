import { useRef, useState } from "react";
import type { CommerceUserDto } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { useAuth } from "@/contexts/auth";
import { useUsers } from "@/contexts/users";
import { useRoles } from "@/contexts/roles";
import { DeleteRecordButton } from "@/components/DeleteRecordButton";

export function UserCard({ user }: { user: CommerceUserDto }) {
  const { session } = useAuth();
  const { updateUser, deleteUser } = useUsers();
  const { roles } = useRoles();
  const [isChanging, setIsChanging] = useState(false);
  const busy = useRef(false);
  const canManage = session?.permissions.includes("users.manage") ?? false;
  const isCurrentUser = user.id === session?.user.id;
  const roleName = user.isOwner ? "Creador del comercio" : roles.find((role) => role.id === user.commerceRole.id)?.name ?? user.commerceRole.name;

  const changeStatus = () => {
    if (busy.current || isChanging || !canManage || isCurrentUser || user.isOwner) return;
    busy.current = true;
    setIsChanging(true);
    const finish = () => { busy.current = false; setIsChanging(false); };
    Alert.alert(
      user.isActive ? "Desactivar acceso" : "Reactivar acceso",
      user.isActive
        ? `¿Querés desactivar el acceso de ${user.username} a este comercio? Se cerrarán sus sesiones.`
        : `¿Querés reactivar el acceso de ${user.username} a este comercio?`,
      [
        { text: "Cancelar", style: "cancel", onPress: finish },
        {
          text: user.isActive ? "Desactivar" : "Reactivar",
          style: user.isActive ? "destructive" : "default",
          onPress: () => {
            void updateUser(user.id, { isActive: !user.isActive }).catch((error) => {
              Alert.alert("No se pudo cambiar el acceso", error instanceof Error ? error.message : "Intentá nuevamente.");
            }).finally(finish);
          },
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <View className={`rounded-2xl border p-4 ${user.isActive
      ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      : "border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800"}`}>
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-950 dark:text-white">{user.name}</Text>
          {!!user.email && <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">{user.email}</Text>}
          <Text className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{roleName}</Text>
          {user.employee && <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Empleado: {user.employee.name}{!user.employee.isActive ? " (desactivado)" : ""}
          </Text>}
          {isCurrentUser && <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tu cuenta</Text>}
        </View>
        <View className={`rounded-full px-2.5 py-1 ${user.isActive ? "bg-green-100 dark:bg-green-950" : "bg-gray-200 dark:bg-gray-700"}`}>
          <Text className={`text-xs font-semibold ${user.isActive ? "text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300"}`}>
            {user.isActive ? "Activo" : "Inactivo"}
          </Text>
        </View>
      </View>
      {canManage && (!user.isOwner || isCurrentUser) && (
        <View className="mt-4 flex-row gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
          <Link href={{ pathname: "/more/users/[id]/edit", params: { id: user.id } }} asChild>
            <Pressable disabled={isChanging} accessibilityRole="button" accessibilityLabel={`Editar usuario ${user.username}`}
              className="flex-row items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 dark:bg-gray-800">
              <Ionicons name="create-outline" size={20} color="#9ca3af" />
              <Text className="font-semibold text-gray-700 dark:text-gray-200">Editar</Text>
            </Pressable>
          </Link>
          {!isCurrentUser && !user.isOwner && (
            <Pressable disabled={isChanging} onPress={changeStatus} accessibilityRole="button"
              className="flex-1 items-center justify-center rounded-xl border border-gray-300 px-3 py-2 dark:border-gray-600">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {isChanging ? "Procesando..." : user.isActive ? "Desactivar" : "Reactivar"}
              </Text>
            </Pressable>
          )}
        </View>
      )}
      {canManage && !isCurrentUser && !user.isOwner && (
        <DeleteRecordButton name={user.name} disabled={isChanging} onBusyChange={setIsChanging}
          description="Solo se puede eliminar una cuenta sin ventas, compras ni jornadas creadas. La ficha del empleado se conservará."
          onDelete={() => deleteUser(user.id)} />
      )}
    </View>
  );
}
