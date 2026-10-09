import { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, Text } from "react-native";

type Props = {
  name: string;
  description: string;
  disabled: boolean;
  onDelete: () => Promise<void>;
  onBusyChange: (busy: boolean) => void;
};

export function DeleteRecordButton({ name, description, disabled, onDelete, onBusyChange }: Props) {
  const busy = useRef(false);
  const finish = () => { busy.current = false; onBusyChange(false); };
  const remove = async () => {
    try { await onDelete(); }
    catch (error) { Alert.alert("No se pudo eliminar", error instanceof Error ? error.message : "Intentá nuevamente."); }
    finally { finish(); }
  };
  const confirm = () => {
    if (disabled || busy.current) return;
    busy.current = true;
    onBusyChange(true);
    Alert.alert("Eliminar definitivamente", `${name}\n\n${description}`, [
      { text: "Cancelar", style: "cancel", onPress: finish },
      { text: "Continuar", style: "destructive", onPress: () => {
        Alert.alert("Confirmación final", "Esta acción no se puede deshacer. ¿Confirmás la eliminación?", [
          { text: "Cancelar", style: "cancel", onPress: finish },
          { text: "Eliminar", style: "destructive", onPress: () => { void remove(); } },
        ], { cancelable: false });
      } },
    ], { cancelable: false });
  };
  return (
    <Pressable disabled={disabled} onPress={(event) => { event.stopPropagation(); confirm(); }}
      accessibilityRole="button" accessibilityLabel={`Eliminar definitivamente ${name}`}
      className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-red-400 px-4 py-3 active:opacity-60">
      <Ionicons name="trash-outline" size={20} color="#dc2626" />
      <Text className="font-semibold text-red-600 dark:text-red-400">Eliminar definitivamente</Text>
    </Pressable>
  );
}
