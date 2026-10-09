import { useCallback, useEffect, useRef, useState } from "react";
import type { CommerceUserDto, EmployeeAccountOption, UpdateCommerceUserDto } from "@almacen/shared";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/contexts/auth";
import { useRoles } from "@/contexts/roles";
import { UserFields } from "./UserFields";
import { createUserFormState, validateUserForm, type UserFormState } from "./user-form.utils";
import { getEmployeeAccountOptionsRequest } from "@/services/usersApi";

type Props = {
  user?: CommerceUserDto;
  onSubmit: (data: UpdateCommerceUserDto) => Promise<void>;
  onCancel: () => void;
};

export function UserForm({ user, onSubmit, onCancel }: Props) {
  const { session } = useAuth();
  const { roles, isLoadingRoles, rolesError, refreshRoles } = useRoles();
  const [values, setValues] = useState(() => createUserFormState(user));
  const [isSaving, setIsSaving] = useState(false);
  const submitting = useRef(false);
  const canReadRoles = session?.permissions.includes("roles.read") ?? false;
  const canAssignRole = canReadRoles && user?.id !== session?.user.id;
  const canLinkEmployee = (session?.permissions.includes("users.manage") ?? false) && !user?.isOwner && !user?.employee;
  const [employees, setEmployees] = useState<EmployeeAccountOption[]>([]);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(canLinkEmployee);
  const employeeRequest = useRef(0);
  const refreshEmployees = useCallback(async () => {
    const version = ++employeeRequest.current;
    if (!canLinkEmployee) { setEmployees([]); setIsLoadingEmployees(false); return; }
    setIsLoadingEmployees(true);
    setEmployeesError(null);
    try {
      const options = await getEmployeeAccountOptionsRequest();
      if (employeeRequest.current === version) setEmployees(options);
    } catch (error) {
      if (employeeRequest.current === version) setEmployeesError(error instanceof Error ? error.message : "No se pudieron cargar los empleados.");
    } finally {
      if (employeeRequest.current === version) setIsLoadingEmployees(false);
    }
  }, [canLinkEmployee, session?.user.id]);
  useEffect(() => {
    void refreshEmployees();
    return () => { employeeRequest.current += 1; };
  }, [refreshEmployees]);
  const updateValues = (changes: Partial<UserFormState>) => setValues((current) => ({ ...current, ...changes }));

  const handleSubmit = async () => {
    if (submitting.current) return;
    const result = validateUserForm(values, user);
    if (!result.ok) { Alert.alert("Revisá los datos", result.message); return; }
    if (result.data.roleId !== undefined && !roles.some((role) => role.id === result.data.roleId && role.isActive)) {
      Alert.alert("Revisá el rol", "Seleccioná un rol activo disponible en este comercio.");
      return;
    }
    if (result.data.employeeId != null && !employees.some((employee) => employee.id === result.data.employeeId && employee.isActive && employee.userId === null)) {
      Alert.alert("Revisá el empleado", "Seleccioná un empleado activo que no tenga otra cuenta vinculada.");
      return;
    }
    try {
      submitting.current = true;
      setIsSaving(true);
      await onSubmit(result.data);
      setValues((current) => ({ ...current, password: "", passwordConfirmation: "" }));
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
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {user?.isOwner ? `${user.name} · Creador de ${session?.commerce.name}` : `Esta cuenta permitirá iniciar sesión en ${session?.commerce.name}. Podés vincular su ficha de empleado para que una baja laboral también cierre su acceso.`}
        </Text>
        {canAssignRole && isLoadingRoles && <Text className="text-gray-500 dark:text-gray-400">Cargando roles...</Text>}
        {canAssignRole && rolesError && (
          <View className="gap-3 rounded-xl border border-red-300 bg-red-50 p-4 dark:bg-red-950">
            <Text className="text-red-700 dark:text-red-300">{rolesError}</Text>
            <AuthButton label="Reintentar roles" secondary onPress={() => void refreshRoles()} disabled={isSaving} />
          </View>
        )}
        {canLinkEmployee && isLoadingEmployees && <Text className="text-gray-500 dark:text-gray-400">Cargando empleados...</Text>}
        {canLinkEmployee && employeesError && <View className="gap-3 rounded-xl border border-red-300 p-4">
          <Text className="text-red-600 dark:text-red-300">{employeesError}</Text>
          <AuthButton label="Reintentar empleados" secondary onPress={() => void refreshEmployees()} disabled={isSaving} />
        </View>}
        <UserFields values={values} onChange={updateValues} roles={roles} disabled={isSaving} editing={!!user} isOwner={user?.isOwner}
          canAssignRole={canAssignRole} currentRoleName={user?.isOwner ? "Creador del comercio" : user?.commerceRole.name}
          employees={employees} canLinkEmployee={canLinkEmployee} employeeSelectionDisabled={isLoadingEmployees || !!employeesError} linkedEmployee={user?.employee} />
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1"><AuthButton label="Cancelar" secondary disabled={isSaving} onPress={onCancel} /></View>
          <View className="flex-1"><AuthButton label={user ? "Guardar cambios" : "Crear usuario"} loading={isSaving}
            disabled={!user && (isLoadingRoles || !!rolesError)} onPress={() => void handleSubmit()} /></View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
