import { useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { getWorkShiftLocalFields, isWorkShiftInPast, type WorkShiftDto } from "@almacen/shared";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthField } from "@/components/auth/AuthField";
import { useWorkShifts } from "@/contexts/work-shifts";
import { useCommerceFormat } from "@/hooks/use-commerce-format";
import { cancelWorkShiftRequest, recordWorkShiftRequest } from "@/services/workShiftsApi";
import { attendanceMinutes, dateLabel, formatMinutes, plannedBreakMinutes, shiftStatus } from "./work-shift-calendar.utils";
import { shiftTimeRange } from "./work-shift-details.utils";
import { WorkShiftAttendance } from "./WorkShiftAttendance";
import { JourneyIcon } from "./JourneyIcon";

export function WorkShiftCard({ shift, readOnly = false, showDate = true }: { shift: WorkShiftDto; readOnly?: boolean; showDate?: boolean }) {
  const { session, canManage, timeZone, now, today, refreshCalendar } = useWorkShifts();
  const { formatTime } = useCommerceFormat();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const running = useRef(false);
  const status = shiftStatus(shift, now);
  const canRecord = !readOnly && (canManage || session?.employee?.id === shift.employeeId);
  const expired = isWorkShiftInPast(shift.endsAt, now);
  const canStart = shift.status === "SCHEDULED" && !expired && (getWorkShiftLocalFields(shift.startsAt, timeZone).date === today || (Date.parse(shift.startsAt) <= now && now < Date.parse(shift.endsAt)));

  const act = async (action: () => Promise<unknown>) => {
    if (running.current) return;
    running.current = true; setBusy(true); setError(null);
    try { await action(); setCancelling(false); setReason(""); await refreshCalendar(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo completar la operación."); }
    finally { running.current = false; setBusy(false); }
  };
  const plannedMinutes = (Date.parse(shift.endsAt) - Date.parse(shift.startsAt)) / 60000;
  return <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
    <View className="flex-row items-start gap-3">
      <JourneyIcon icon={shift.icon} color={shift.color} iconColor={shift.iconColor} size={44} />
      <View className="flex-1 gap-1">
        <Text className="text-lg font-bold text-gray-950 dark:text-white">{shift.name ?? "Turno laboral"}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">{shift.employee.name}</Text>
        <View className="flex-row items-center gap-1"><Ionicons name={status.icon} size={16} color={status.color} /><Text style={{ color: status.color }} className="text-sm font-semibold">{status.label}</Text></View>
      </View>
    </View>
    <View className="gap-1 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
      {showDate && <Text className="text-sm font-semibold capitalize text-emerald-800 dark:text-emerald-200">{dateLabel(getWorkShiftLocalFields(shift.startsAt, timeZone).date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</Text>}
      <Text className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{shiftTimeRange(shift.startsAt, shift.endsAt, timeZone)}</Text>
    </View>
    <Text className="text-sm text-gray-500 dark:text-gray-400">Bloque previsto: {formatMinutes(plannedMinutes)} · Descansos previstos: {formatMinutes(plannedBreakMinutes(shift))}</Text>
    <WorkShiftAttendance shift={shift} now={now} />
    {shift.actualStartedAt && shift.actualEndedAt && <Text className="text-sm text-gray-600 dark:text-gray-300">Tiempo entre entrada y salida: {formatMinutes(attendanceMinutes(shift))}.</Text>}
    {shift.notes && <Text className="text-sm text-gray-500 dark:text-gray-400">{shift.notes}</Text>}
    {shift.breaks.map((item, index) => {
      return <View key={item.id} className="gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
        <Text className="font-semibold text-gray-950 dark:text-white">Descanso {index + 1} · {item.mode === "FLEXIBLE" ? `${item.durationMinutes} min, horario flexible` : `${formatTime(item.startsAt)}–${formatTime(item.endsAt)}`}</Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">Descanso definido por la jornada; no se ficha por separado.</Text>
      </View>;
    })}
    {canRecord && canStart && <AuthButton label="Registrar entrada" disabled={busy} loading={busy} onPress={() => void act(() => recordWorkShiftRequest(shift.id, "start"))} />}
    {canRecord && shift.status === "IN_PROGRESS" && <AuthButton label="Registrar salida" disabled={busy} loading={busy} onPress={() => void act(() => recordWorkShiftRequest(shift.id, "finish"))} />}
    {canRecord && (canStart || shift.status === "IN_PROGRESS") && <Text className="text-xs text-gray-500 dark:text-gray-400">Entrada, salida y descansos se registran con la hora actual del servidor.</Text>}
    {!readOnly && canManage && !expired && shift.status === "SCHEDULED" && <>
      {!cancelling ? <AuthButton label="Cancelar turno" secondary disabled={busy} onPress={() => setCancelling(true)} /> : <View className="gap-3">
        <AuthField label="Motivo de cancelación" value={reason} maxLength={1000} editable={!busy} onChangeText={setReason} />
        <AuthButton label="Confirmar cancelación" disabled={busy || !reason.trim()} onPress={() => void act(() => cancelWorkShiftRequest(shift.id, reason.trim()))} />
        <AuthButton label="Volver sin cancelar" secondary disabled={busy} onPress={() => setCancelling(false)} />
      </View>}
    </>}
    {error && <Text accessibilityRole="alert" className="text-sm text-red-600 dark:text-red-400">{error}</Text>}
  </View>;
}
