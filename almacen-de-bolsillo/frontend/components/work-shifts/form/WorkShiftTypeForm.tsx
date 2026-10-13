import type { CreateWorkShiftTypeDto, WorkShiftType } from "@almacen/shared";
import { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { Field, FormPage } from "./FormControls";

const colors = ["#2563EB", "#16A34A", "#EA580C", "#DC2626", "#9333EA", "#475569"];

export function WorkShiftTypeForm({ initialValues, onSubmit, onCancel }: {
  initialValues?: WorkShiftType;
  onSubmit: (data: CreateWorkShiftTypeDto & { isActive?: boolean }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [isNonWorkingDay, setIsNonWorkingDay] = useState(initialValues?.isNonWorkingDay ?? false);
  const [startTime, setStartTime] = useState(initialValues?.startTime ?? "08:00");
  const [endTime, setEndTime] = useState(initialValues?.endTime ?? "14:00");
  const [color, setColor] = useState(initialValues?.color ?? colors[0]);
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (saving) return;
    setError(null);
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!name.trim() || name.trim().length > 60) {
      setError("El nombre debe tener entre 1 y 60 caracteres.");
      return;
    }
    if (!isNonWorkingDay && (!timePattern.test(startTime.trim()) || !timePattern.test(endTime.trim()) || startTime.trim() === endTime.trim())) {
      setError("Ingresá horarios distintos y válidos con formato HH:mm.");
      return;
    }
    try {
      setSaving(true);
      await onSubmit({
        name: name.trim(), isNonWorkingDay,
        startTime: isNonWorkingDay ? null : startTime.trim(),
        endTime: isNonWorkingDay ? null : endTime.trim(), color,
        ...(initialValues ? { isActive } : {}),
      });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo guardar la jornada.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormPage saving={saving} onSave={() => void save()} onCancel={onCancel}>
      <Field label="Nombre de la jornada" value={name} onChangeText={setName} maxLength={60} editable={!saving} placeholder="Mañana, tarde, franco…" />
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-gray-950 dark:text-white">Jornada no laboral</Text>
        <Switch accessibilityLabel="Jornada no laboral" value={isNonWorkingDay} onValueChange={setIsNonWorkingDay} disabled={saving} />
      </View>
      {isNonWorkingDay ? <Text className="text-gray-500">Esta jornada no tiene horario de trabajo.</Text> : (
        <>
          <Field label="Hora de inicio" value={startTime} onChangeText={setStartTime} maxLength={5} placeholder="08:00" editable={!saving} />
          <Field label="Hora de fin" value={endTime} onChangeText={setEndTime} maxLength={5} placeholder="14:00" editable={!saving} />
        </>
      )}
      <Text className="font-semibold text-gray-950 dark:text-white">Color en el calendario</Text>
      <View className="flex-row flex-wrap gap-3">
        {[...new Set([...colors, color])].map((item) => (
          <Pressable key={item} disabled={saving} accessibilityRole="radio" accessibilityLabel={`Color ${item}`} accessibilityState={{ checked: color === item }} onPress={() => setColor(item)} style={{ backgroundColor: item, width: 40, height: 40, borderRadius: 20, borderWidth: color === item ? 4 : 0, borderColor: "#9CA3AF" }} />
        ))}
      </View>
      {initialValues && <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-gray-950 dark:text-white">Jornada activa</Text>
        <Switch accessibilityLabel="Jornada activa" value={isActive} onValueChange={setIsActive} disabled={saving} />
      </View>}
      {error && <Text className="text-red-600 dark:text-red-400">{error}</Text>}
    </FormPage>
  );
}
