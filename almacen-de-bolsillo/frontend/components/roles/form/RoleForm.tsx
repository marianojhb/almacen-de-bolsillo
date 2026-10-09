import { useRef, useState } from "react";
import type { CommerceRoleDto, CreateCommerceRoleDto } from "@almacen/shared";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { AuthField } from "@/components/auth/AuthField";
import { AuthButton } from "@/components/auth/AuthButton";
import { useRoles } from "@/contexts/roles";
import { PermissionSelector } from "./PermissionSelector";
import { createRoleFormState, validateRoleForm, type RoleFormState } from "./role-form.utils";

type Props = {
  role?: CommerceRoleDto;
  onSubmit: (data: CreateCommerceRoleDto) => Promise<void>;
  onCancel: () => void;
};

export function RoleForm({ role, onSubmit, onCancel }: Props) {
  const { permissions, isLoadingPermissions, permissionsError, refreshPermissions } = useRoles();
  const [values, setValues] = useState(() => createRoleFormState(role));
  const [isSaving, setIsSaving] = useState(false);
  const submitting = useRef(false);
  const updateValues = (changes: Partial<RoleFormState>) => setValues((current) => ({ ...current, ...changes }));

  const handleSubmit = async () => {
    if (submitting.current || isLoadingPermissions || permissionsError) return;
    const result = validateRoleForm(values, permissions);
    if (!result.ok) { Alert.alert("Revisá los datos", result.message); return; }
    try {
      submitting.current = true;
      setIsSaving(true);
      await onSubmit(result.data);
    } catch (error) {
      Alert.alert("No se pudo guardar", error instanceof Error ? error.message : "Intentá nuevamente.");
    } finally {
      submitting.current = false;
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50 dark:bg-black"
      behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <ScrollView contentContainerClassName="gap-5 p-4 pb-8" keyboardShouldPersistTaps="handled">
        <AuthField label="Nombre del rol *" value={values.name} onChangeText={(name) => updateValues({ name })}
          placeholder="Ejemplo: Cajero" maxLength={100} editable={!isSaving} />
        <AuthField label="Descripción" value={values.description} onChangeText={(description) => updateValues({ description })}
          placeholder="Funciones de este rol" maxLength={1000} editable={!isSaving} />
        {isLoadingPermissions ? (
          <Text className="py-4 text-center text-gray-500 dark:text-gray-400">Cargando permisos...</Text>
        ) : permissionsError ? (
          <View className="gap-3 rounded-xl border border-red-300 bg-red-50 p-4 dark:bg-red-950">
            <Text className="text-red-700 dark:text-red-300">{permissionsError}</Text>
            <AuthButton label="Reintentar catálogo" secondary disabled={isSaving} onPress={() => void refreshPermissions()} />
          </View>
        ) : (
          <PermissionSelector permissions={permissions} selected={values.permissions}
            onChange={(codes) => updateValues({ permissions: codes })} disabled={isSaving} />
        )}
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1"><AuthButton label="Cancelar" secondary disabled={isSaving} onPress={onCancel} /></View>
          <View className="flex-1"><AuthButton label={role ? "Guardar cambios" : "Crear rol"} loading={isSaving}
            disabled={isLoadingPermissions || !!permissionsError} onPress={() => void handleSubmit()} /></View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
