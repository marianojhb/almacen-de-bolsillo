import { useEffect, useRef, useState } from "react";
import { useRouter, type Href } from "expo-router";
import { ActivityIndicator, ScrollView, Text } from "react-native";
import { getWorkShiftLocalFields, type WorkShiftDto } from "@almacen/shared";
import { useWorkShifts } from "@/contexts/work-shifts";
import { getWorkShiftRequest, updateWorkShiftRequest } from "@/services/workShiftsApi";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthField } from "@/components/auth/AuthField";
import { shiftTimeRange } from "../work-shift-details.utils";

export function WorkShiftForm({ shiftId }: { shiftId: number }) {
  const router = useRouter();
  const { canManage, timeZone, refreshCalendar, navigateDate } = useWorkShifts();
  const [record, setRecord] = useState<WorkShiftDto | null>(null);
  const date = record ? getWorkShiftLocalFields(record.startsAt, timeZone).date : "";
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    void getWorkShiftRequest(shiftId).then((shift) => {
      if (!active) return;
      setRecord(shift);
      setNotes(shift.notes ?? "");
    }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar el turno."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [shiftId, timeZone]);

  const save = async () => {
    if (busy.current || !canManage || record?.status !== "SCHEDULED") return;
    setError(null);
    busy.current = true; setSaving(true);
    try {
      await updateWorkShiftRequest(shiftId, { notes: notes.trim() || null });
      navigateDate(date);
      await refreshCalendar();
      router.dismissTo("/work-shifts" as Href);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar el turno.");
      busy.current = false; setSaving(false);
    }
  };
  if (loading) return <ActivityIndicator size="large" color="#9ca3af" className="mt-8" />;
  if (!record || record.status !== "SCHEDULED" || !canManage) return <Text className="p-4 text-red-600">{error ?? "Solo se pueden editar turnos programados con permiso de gestión."}</Text>;
  return <ScrollView className="flex-1 bg-gray-50 dark:bg-black" contentContainerClassName="gap-5 p-4 pb-10" keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
    <Text className="text-xl font-bold text-gray-950 dark:text-white">{record.employee.name}</Text>
    <Text className="font-semibold text-gray-950 dark:text-white">{record.name}</Text>
    <Text className="text-sm text-gray-500 dark:text-gray-400">{shiftTimeRange(record.startsAt, record.endsAt, timeZone)}</Text>
    <AuthField label="Observaciones" value={notes} editable={!saving} maxLength={1000} onChangeText={setNotes} />
    {error && <Text accessibilityRole="alert" className="text-red-600 dark:text-red-400">{error}</Text>}
    <AuthButton label="Guardar cambios" loading={saving} onPress={() => void save()} />
    <AuthButton label="Volver sin guardar" secondary disabled={saving} onPress={() => router.dismissTo("/work-shifts" as Href)} />
  </ScrollView>;
}
