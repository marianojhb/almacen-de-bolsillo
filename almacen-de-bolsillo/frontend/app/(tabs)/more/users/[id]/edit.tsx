import { router, useLocalSearchParams } from "expo-router";
import { Alert, Text, View } from "react-native";
import { UserForm } from "@/components/users/form/UserForm";
import { AuthButton } from "@/components/auth/AuthButton";
import { useUsers } from "@/contexts/users";

export default function EditUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { users, isLoadingUsers, usersError, refreshUsers, updateUser } = useUsers();
  const userId = Number(id);
  const user = users.find((item) => item.id === userId);

  if (isLoadingUsers) return (
    <View className="flex-1 bg-gray-50 p-4 dark:bg-black"><Text className="text-gray-600 dark:text-gray-300">Cargando usuario...</Text></View>
  );
  if (!Number.isSafeInteger(userId) || userId <= 0 || usersError || !user) return (
    <View className="flex-1 gap-4 bg-gray-50 p-4 dark:bg-black">
      <Text className="text-red-600 dark:text-red-400">{usersError ?? "Usuario no encontrado en este comercio."}</Text>
      {!!usersError && <AuthButton label="Reintentar" secondary onPress={() => void refreshUsers()} />}
      <AuthButton label="Volver" secondary onPress={() => router.back()} />
    </View>
  );
  return (
    <UserForm key={user.id} user={user} onCancel={() => router.back()} onSubmit={async (data) => {
      await updateUser(user.id, data);
      router.replace("/more/users");
      Alert.alert("Usuario actualizado", "Los cambios se guardaron correctamente.");
    }} />
  );
}
