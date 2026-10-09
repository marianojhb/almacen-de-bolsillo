import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { getNonWorkingDayInterval, isWorkShiftInPast, type EmployeeNonWorkingDayDto } from "@almacen/shared";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthField } from "@/components/auth/AuthField";
import { SearchSelect } from "@/components/forms/SearchSelect";
import { useWorkShifts } from "@/contexts/work-shifts";
import { cancelNonWorkingDayRequest, updateNonWorkingDayRequest } from "@/services/workShiftsApi";
import { CalendarField } from "./form/CalendarField";
import { JourneyIcon } from "./JourneyIcon";

export function NonWorkingDayCard({ day, readOnly = false }: { day: EmployeeNonWorkingDayDto; readOnly?: boolean }) {
  const { canManage: canManageAll, types, refreshCalendar, timeZone, now } = useWorkShifts();
  const canManage = canManageAll && !readOnly && !isWorkShiftInPast(getNonWorkingDayInterval(day, timeZone).endsAt, now);
  const [editing, setEditing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [date, setDate] = useState(day.date);
  const [typeId, setTypeId] = useState(String(day.workShiftTypeId ?? ""));
  const [notes, setNotes] = useState(day.notes ?? "");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  useEffect(() => { setDate(day.date); setTypeId(String(day.workShiftTypeId ?? "")); setNotes(day.notes ?? ""); }, [day]);
  const options = types.filter((type) => type.isActive && !type.isWorkingDay).map((type) => ({ value: String(type.id), label: type.name }));
  if (day.workShiftTypeId && !options.some((option) => option.value === String(day.workShiftTypeId))) options.unshift({ value: String(day.workShiftTypeId), label: `${day.name} (asignación original)` });
  const act = async (action: () => Promise<unknown>) => {
    if (running.current || !canManage) return;
    running.current = true; setBusy(true); setError(null);
    try { await action(); setEditing(false); setCancelling(false); await refreshCalendar(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo actualizar el día no laboral."); }
    finally { running.current = false; setBusy(false); }
  };
  return <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
    <View className="flex-row items-center gap-3"><JourneyIcon icon={day.icon} color={day.color} iconColor={day.iconColor} size={44} /><View className="flex-1">
      <Text className="text-lg font-bold text-gray-950 dark:text-white">{day.name}{!day.isActive ? " · Cancelado" : ""}</Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400">{day.employee.name}</Text>
    </View></View>
    <Text className="font-semibold text-gray-950 dark:text-white">Todo el día</Text>
    {day.notes && <Text className="text-sm text-gray-500 dark:text-gray-400">{day.notes}</Text>}
    {canManage && !editing && <AuthButton label="Editar día no laboral" secondary disabled={busy} onPress={() => { setCancelling(false); setEditing(true); }} />}
    {canManage && editing && <View className="gap-3">
      <CalendarField label="Fecha" mode="date" value={date} disabled={busy} onChange={setDate} />
      <SearchSelect label="Tipo de jornada no laboral" value={typeId} options={options} disabled={busy} onChange={setTypeId} />
      <AuthField label="Observaciones" value={notes} maxLength={1000} editable={!busy} onChangeText={setNotes} />
      <AuthButton label="Guardar cambios" loading={busy} onPress={() => void act(() => updateNonWorkingDayRequest(day.id, { date, notes: notes.trim() || null,
        ...(typeId && typeId !== String(day.workShiftTypeId ?? "") && { workShiftTypeId: Number(typeId) }) }))} />
      <AuthButton label="Volver sin guardar" secondary disabled={busy} onPress={() => { setDate(day.date); setTypeId(String(day.workShiftTypeId ?? "")); setNotes(day.notes ?? ""); setEditing(false); }} />
    </View>}
    {canManage && day.isActive && !editing && (!cancelling ? <AuthButton label="Cancelar día no laboral" secondary disabled={busy} onPress={() => setCancelling(true)} /> : <View className="gap-3">
      <AuthField label="Motivo de cancelación" value={reason} maxLength={1000} editable={!busy} onChangeText={setReason} />
      <AuthButton label="Confirmar cancelación" disabled={busy || !reason.trim()} onPress={() => void act(() => cancelNonWorkingDayRequest(day.id, reason.trim()))} />
      <AuthButton label="Volver sin cancelar" secondary disabled={busy} onPress={() => setCancelling(false)} />
    </View>)}
    {canManage && !day.isActive && !editing && <>
      <AuthButton label="Reactivar día no laboral" disabled={busy} loading={busy} onPress={() => void act(() => updateNonWorkingDayRequest(day.id, { isActive: true }))} />
    </>}
    {error && <Text accessibilityRole="alert" className="text-sm text-red-600 dark:text-red-400">{error}</Text>}
  </View>;
}
