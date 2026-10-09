import type { CommerceRoleDto, CommerceUserDto, EmployeeAccountOption } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { SearchSelect } from "@/components/forms/SearchSelect";
import { EmailField } from "@/components/auth/EmailField";
import { AuthField } from "@/components/auth/AuthField";
import type { UserFormState } from "./user-form.utils";

type Props = {
  values: UserFormState;
  onChange: (changes: Partial<UserFormState>) => void;
  roles: CommerceRoleDto[];
  disabled: boolean;
  editing: boolean;
  isOwner?: boolean;
  canAssignRole: boolean;
  currentRoleName?: string;
  employees: EmployeeAccountOption[];
  canLinkEmployee: boolean;
  employeeSelectionDisabled: boolean;
  linkedEmployee?: CommerceUserDto["employee"];
};

export function UserFields({ values, onChange, roles, disabled, editing, isOwner, canAssignRole, currentRoleName, employees, canLinkEmployee, employeeSelectionDisabled, linkedEmployee }: Props) {
  const availableRoles = roles.filter((role) => role.isActive || role.id === values.roleId);

  return (
    <View className="gap-5">
      {!isOwner && <>
      <AuthField label="Usuario *" value={values.username} onChangeText={(username) => onChange({ username: username.toLowerCase() })}
        autoCapitalize="none" autoCorrect={false} maxLength={254} editable={!disabled} placeholder="cajero_juan" />
      <Text className="-mt-3 text-xs text-gray-500 dark:text-gray-400">
        Para usuarios nuevos usá letras, números, guiones o guiones bajos, sin espacios. Siempre se muestran en minúsculas.
      </Text>
      </>}
      <EmailField label={isOwner ? "Correo electrónico del dueño *" : "Correo electrónico *"} value={values.email} onChangeText={(email) => onChange({ email })}
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={254} editable={!disabled} />
      {isOwner && <Text className="text-sm text-gray-500 dark:text-gray-400">El creador inicia sesión desde Comercio. No tiene usuario personal; este correo identifica su cuenta.</Text>}
      <AuthField label={editing ? "Nueva contraseña (opcional)" : "Contraseña *"} isPassword value={values.password}
        onChangeText={(password) => onChange({ password })} autoCapitalize="none" autoCorrect={false} maxLength={128} editable={!disabled} />
      <AuthField label={editing ? "Confirmar nueva contraseña" : "Confirmar contraseña *"} isPassword value={values.passwordConfirmation}
        onChangeText={(passwordConfirmation) => onChange({ passwordConfirmation })} autoCapitalize="none" autoCorrect={false}
        maxLength={128} editable={!disabled} />
      {editing && <Text className="-mt-3 text-xs text-gray-500 dark:text-gray-400">
        Dejá ambos campos vacíos para conservar la contraseña. Cambiarla cerrará las sesiones de esa cuenta.
      </Text>}
      {(canLinkEmployee || linkedEmployee) && <View className="gap-2">
        <Text className="font-semibold text-gray-950 dark:text-white">Empleado vinculado (opcional)</Text>
        {linkedEmployee ? (
          <View className="rounded-xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
            <Text className="text-gray-950 dark:text-white">{linkedEmployee.name}{!linkedEmployee.isActive ? " (desactivado)" : ""}</Text>
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">El vínculo se conserva para proteger el historial. Reactivar la ficha no reactiva el acceso automáticamente.</Text>
          </View>
        ) : <>
          <SearchSelect label="Empleado vinculado" showLabel={false} value={values.employeeId?.toString() ?? ""}
            disabled={disabled || employeeSelectionDisabled}
            onChange={(value) => onChange({ employeeId: value ? Number(value) : null })}
            options={[
              { value: "", label: "Sin empleado vinculado" },
              ...employees.filter((employee) => employee.isActive && employee.userId === null).map((employee) => ({
                value: employee.id.toString(), label: employee.name,
                description: "EMP-" + employee.commerceEmployeeId.toString().padStart(4, "0"),
              })),
            ]} />
          <Text className="text-xs text-gray-500 dark:text-gray-400">Solo aparecen empleados activos sin cuenta. Una vez guardado, el vínculo no se puede cambiar. Podés crear la cuenta sin vínculo y asignarlo después.</Text>
        </>}
      </View>}
      <View className="gap-2">
        <Text className="font-semibold text-gray-950 dark:text-white">Rol *</Text>
        {canAssignRole ? (
          availableRoles.length ? availableRoles.map((role) => {
            const selected = role.id === values.roleId;
            return (
              <Pressable key={role.id} disabled={disabled || !role.isActive}
                onPress={() => onChange({ roleId: role.id })} accessibilityRole="radio"
                accessibilityLabel={role.name} accessibilityState={{ checked: selected, disabled: disabled || !role.isActive }}
                className={`flex-row items-center gap-3 rounded-xl border p-3 ${selected
                  ? "border-gray-950 bg-gray-100 dark:border-white dark:bg-gray-800"
                  : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"}`}>
                <Ionicons name={selected ? "radio-button-on" : "radio-button-off"} size={22} color="#9ca3af" />
                <View className="flex-1">
                  <Text className="font-semibold text-gray-950 dark:text-white">{role.name}{!role.isActive ? " (inactivo)" : ""}</Text>
                  {!!role.description && <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">{role.description}</Text>}
                </View>
              </Pressable>
            );
          }) : <Text className="text-gray-500 dark:text-gray-400">No hay roles activos disponibles.</Text>
        ) : (
          <View className="rounded-xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
            <Text className="text-gray-950 dark:text-white">{currentRoleName ?? "Sin rol disponible"}</Text>
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">No podés cambiar el rol desde esta edición.</Text>
          </View>
        )}
      </View>
    </View>
  );
}
