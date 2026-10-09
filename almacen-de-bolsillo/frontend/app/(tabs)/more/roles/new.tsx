import { router } from "expo-router";
import { Alert } from "react-native";
import { RoleForm } from "@/components/roles/form/RoleForm";
import { useRoles } from "@/contexts/roles";

export default function NewRoleScreen() {
  const { addRole } = useRoles();
  return (
    <RoleForm onCancel={() => router.back()} onSubmit={async (data) => {
      const role = await addRole(data);
      router.replace("/more/roles");
      Alert.alert("Rol creado", `El rol ${role.name} está disponible para asignarlo a los usuarios del comercio.`);
    }} />
  );
}
