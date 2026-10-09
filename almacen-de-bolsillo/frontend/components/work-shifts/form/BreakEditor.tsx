import { useMemo, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import type { WorkShiftBreakInput } from "@almacen/shared";
import { AuthField } from "@/components/auth/AuthField";
import { AuthButton } from "@/components/auth/AuthButton";
import { CalendarField } from "./CalendarField";
import { InfoHint } from "./InfoHint";
import { breakTimeChoices, breakValidationMessage, newBreakForShift } from "./break-editor.utils";
import { WorkShiftDialog } from "../WorkShiftDialog";

export function ToggleField({ label, value, onChange, disabled = false }: { label: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <View className="min-h-12 flex-row items-center justify-between gap-3">
    <Text className="flex-1 text-base text-gray-950 dark:text-white">{label}</Text>
    <Switch value={value} onValueChange={onChange} disabled={disabled} accessibilityLabel={label} />
  </View>;
}

type Props = { value: WorkShiftBreakInput[]; onChange: (value: WorkShiftBreakInput[]) => void; disabled?: boolean; shiftStartTime: string; shiftEndTime: string; shiftEndsNextDay: boolean };

export function BreakEditor({ value, onChange, disabled = false, shiftStartTime, shiftEndTime, shiftEndsNextDay }: Props) {
  const [warning, setWarning] = useState<string | null>(null);
  const block = useMemo(() => ({ startTime: shiftStartTime, endTime: shiftEndTime, endsNextDay: shiftEndsNextDay }), [shiftStartTime, shiftEndTime, shiftEndsNextDay]);
  const error = breakValidationMessage(block, value);
  const choices = useMemo(() => value.map((item, index) => item.mode === "FIXED" ? {
    start: breakTimeChoices(block, value, index, "startTime"), end: breakTimeChoices(block, value, index, "endTime"),
  } : null), [block, value]);
  const update = (index: number, next: WorkShiftBreakInput) => {
    const updated = value.map((item, position) => position === index ? next : item);
    const message = breakValidationMessage(block, updated);
    if (message && next.mode === "FIXED") { setWarning(message); return; }
    onChange(updated);
  };
  const changeMode = (index: number, mode: "FIXED" | "FLEXIBLE") => {
    if (value[index]?.mode === mode) return;
    const next = newBreakForShift(block, value.filter((_, position) => position !== index), mode);
    if (!next) { setWarning("No hay espacio disponible para ese descanso dentro del horario laboral."); return; }
    update(index, next);
  };
  return (
    <View className="gap-3">
      <View style={{ zIndex: 20 }} className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-950 dark:text-white">Descansos</Text>
        <InfoHint label="Cómo funcionan los descansos" text="Flexible: se define una duración y el empleado elige cuándo iniciarlo. Con horario: inicio y fin deben estar dentro de la jornada. Los descansos no pueden superponerse ni ocupar toda la jornada." />
      </View>
      {error && <Text accessibilityRole="alert" className="text-sm text-red-600 dark:text-red-400">{error}</Text>}
      {value.map((item, index) => (
        <View key={index} className="gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="font-semibold text-gray-950 dark:text-white">Descanso {index + 1}</Text>
            <Pressable disabled={disabled} accessibilityRole="button" accessibilityLabel={`Quitar descanso ${index + 1}`}
              onPress={() => onChange(value.filter((_, position) => position !== index))} className="min-h-11 justify-center px-2">
              <Text className="font-semibold text-red-600 dark:text-red-400">Quitar</Text>
            </Pressable>
          </View>
          <View className="flex-row gap-2">
            {(["FLEXIBLE", "FIXED"] as const).map((mode) => <Pressable key={mode} disabled={disabled}
              accessibilityRole="radio" accessibilityState={{ checked: item.mode === mode }}
              onPress={() => changeMode(index, mode)}
              className={`flex-1 items-center rounded-xl border p-3 ${item.mode === mode ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950" : "border-gray-300 dark:border-gray-700"}`}>
              <Text className="font-semibold text-gray-950 dark:text-white">{mode === "FLEXIBLE" ? "Flexible" : "Con horario"}</Text>
            </Pressable>)}
          </View>
          {item.mode === "FLEXIBLE" ? <AuthField label="Duración en minutos" keyboardType="number-pad" value={String(item.durationMinutes || "")}
            editable={!disabled} onChangeText={(text) => update(index, { ...item, durationMinutes: Number(text.replace(/\D/g, "")) })} /> : <>
            <View className="flex-row gap-3">
              <View className="flex-1"><CalendarField label="Inicio del descanso" mode="time" value={item.startTime} allowedTimes={choices[index]?.start} disabled={disabled} onChange={(startTime) => update(index, { ...item, startTime })} /></View>
              <View className="flex-1"><CalendarField label="Fin del descanso" mode="time" value={item.endTime} allowedTimes={choices[index]?.end} disabled={disabled} onChange={(endTime) => update(index, { ...item, endTime })} /></View>
            </View>
            {shiftEndsNextDay && (item.startTime < shiftStartTime || item.endTime < shiftStartTime) &&
              <Text className="text-xs text-emerald-700 dark:text-emerald-300">{item.startTime < shiftStartTime ? "Este descanso comienza al día siguiente." : "Este descanso continúa hasta el día siguiente."}</Text>}
          </>}
        </View>
      ))}
      {value.length < 8 && <AuthButton label="Agregar descanso" secondary disabled={disabled || !!error} onPress={() => {
        const next = newBreakForShift(block, value, "FLEXIBLE");
        if (next) onChange([...value, next]);
        else setWarning("No queda tiempo disponible para otro descanso.");
      }} />}
      <WorkShiftDialog visible={!!warning} title="Revisá el descanso" onClose={() => setWarning(null)}>
        <Text className="text-gray-600 dark:text-gray-300">{warning}</Text>
        <AuthButton label="Entendido" onPress={() => setWarning(null)} />
      </WorkShiftDialog>
    </View>
  );
}
