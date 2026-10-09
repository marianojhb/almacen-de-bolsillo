import { router } from "expo-router";
import { Alert } from "react-native";
import { UserForm } from "@/components/users/form/UserForm";
import { useUsers } from "@/contexts/users";

export default function NewUserScreen() {
  const { addUser } = useUsers();
  return (
    <UserForm onCancel={() => router.back()} onSubmit={async (data) => {
      if (!data.username || !data.email || !data.password || !data.roleId) {
        throw new Error("Completá los datos obligatorios del usuario.");
      }
      const user = await addUser({
        username: data.username, email: data.email, password: data.password, roleId: data.roleId,
      });
      router.replace("/more/users");
      Alert.alert("Usuario creado", `${user.username} ya tiene acceso al comercio con el rol ${user.commerceRole.name}.`);
    }} />
  );
}
