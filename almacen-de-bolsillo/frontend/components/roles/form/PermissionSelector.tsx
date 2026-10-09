import { Fragment, useMemo, useState } from "react";
import { normalizePermissions, permissionOptions, permissionPresets, togglePermissionOption, type PermissionOption, type PermissionDto } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, Switch, Text, TextInput, View } from "react-native";
import { permissionGroupNames } from "./role-form.utils";

type Props = { permissions: PermissionDto[]; selected: string[]; onChange: (codes: string[]) => void; disabled: boolean };

export function PermissionSelector({ permissions, selected, onChange, disabled }: Props) {
  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const effective = normalizePermissions(selected);
  const additionalSelected = permissionOptions.filter((option) => option.additional &&
    option.codes.some((code) => effective.includes(code))).length;
  const groups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const groups: { module: string; items: PermissionOption[] }[] = [];
    for (const module of Object.keys(permissionGroupNames)) {
      const moduleOptions = permissionOptions.filter((option) => option.module === module);
      const visibleOptions = moduleOptions.filter((option) => !option.additional || showAdvanced);
      const allowedOptions = visibleOptions.filter((option) =>
        option.codes.every((code) => permissions.some((permission) => permission.code === code)));
      const matchingOptions = allowedOptions.filter((option) =>
        !query || (permissionGroupNames[module] + " " + option.label).toLowerCase().includes(query));
      matchingOptions.sort((a, b) => Number(!!a.additional) - Number(!!b.additional));
      if (matchingOptions.length) groups.push({ module, items: matchingOptions });
    }
    return groups;
  }, [permissions, search, showAdvanced]);

  const clearPermissions = () => Alert.alert("Quitar todos los permisos",
    "Se deseleccionarán todas las funciones, incluidas las avanzadas. El cambio se aplicará al guardar el rol.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Deseleccionar todos", style: "destructive", onPress: () => onChange([]) },
    ]);

  return (
    <View className="gap-3">
      <Text className="text-lg font-semibold text-gray-950 dark:text-white">Funciones del rol</Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        Podés partir de un perfil y ajustar sus funciones. Aplicar un perfil reemplaza la selección actual.
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {permissionPresets.map((preset) => (
          <Pressable key={preset.name} disabled={disabled} accessibilityRole="button"
            accessibilityLabel={"Aplicar perfil " + preset.name} accessibilityHint={preset.description}
            onPress={() => onChange(normalizePermissions(preset.codes).filter((code) => permissions.some((item) => item.code === code)))}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
            <Text className="font-semibold text-gray-700 dark:text-gray-200">{preset.name}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable disabled={disabled || effective.length === 0} onPress={clearPermissions}
        accessibilityRole="button" accessibilityLabel="Deseleccionar todos los permisos"
        className={`items-center rounded-xl border border-red-300 p-3 ${disabled || !effective.length ? "opacity-40" : ""}`}>
        <Text className="font-semibold text-red-600 dark:text-red-400">Deseleccionar todos los permisos</Text>
      </Pressable>
      <View
        className="flex-row items-center justify-between rounded-xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
        <View className="mr-3 flex-1">
          <Text className="font-semibold text-gray-700 dark:text-gray-200">Mostrar opciones avanzadas</Text>
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {showAdvanced ? "Visibles" : "Ocultas"} · {additionalSelected} seleccionadas. Mostrar u ocultar no cambia los permisos.
          </Text>
        </View>
        <Switch value={showAdvanced} onValueChange={setShowAdvanced} disabled={disabled}
          accessibilityLabel="Mostrar opciones avanzadas" trackColor={{ false: "#9ca3af", true: "#16a34a" }} />
      </View>
      <TextInput value={search} onChangeText={setSearch} editable={!disabled} accessibilityLabel="Buscar funciones"
        placeholder="Buscar módulo o función" placeholderTextColor="#9ca3af"
        className="h-12 rounded-xl border border-gray-300 bg-white px-3 text-base text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        Crear, editar o dar de baja habilita la consulta necesaria. Quitar la consulta también quita las acciones que dependen de ella.
        Las categorías y los datos básicos relacionados se habilitan automáticamente.
      </Text>
      {groups.map(({ module, items }) => (
        <View key={module} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <Text className="mb-2 text-base font-semibold text-gray-950 dark:text-white">{permissionGroupNames[module]}</Text>
          {items.map((option, index) => {
            const checked = option.codes.every((code) => effective.includes(code));
            const partial = !checked && option.codes.some((code) => effective.includes(code));
            return (
              <Fragment key={option.id}>
              {option.additional && !items[index - 1]?.additional && (
                <View className="mb-1 mt-3 border-t border-gray-300 pt-3 dark:border-gray-600">
                  <Text className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Opciones avanzadas</Text>
                </View>
              )}
              <Pressable disabled={disabled} accessibilityRole="checkbox"
                accessibilityLabel={option.label} accessibilityState={{ checked: partial ? "mixed" : checked, disabled }}
                onPress={() => onChange(togglePermissionOption(selected, option, !checked))}
                className={`flex-row items-center gap-3 py-3 ${option.additional ? "rounded-lg bg-gray-50 px-2 dark:bg-gray-800" : ""}`}>
                <Ionicons name={checked ? "checkbox" : partial ? "remove-circle-outline" : "square-outline"} size={24} color="#9ca3af" />
                <View className="flex-1">
                  <Text className="text-gray-950 dark:text-white">{option.label}</Text>
                  {partial && <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">Acceso parcial existente. Marcá para habilitar crear y editar.</Text>}
                </View>
              </Pressable>
              </Fragment>
            );
          })}
        </View>
      ))}
      {!groups.length && <Text className="py-3 text-center text-gray-500 dark:text-gray-400">No se encontraron funciones.</Text>}
    </View>
  );
}
