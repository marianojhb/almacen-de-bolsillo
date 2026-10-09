import { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { AuthButton } from "@/components/auth/AuthButton";
import { useWorkShifts } from "@/contexts/work-shifts";
import { WorkShiftCard } from "./WorkShiftCard";
import { NonWorkingDayCard } from "./NonWorkingDayCard";
import { InfoHint } from "./form/InfoHint";
import { dateLabel, formatMinutes, moveCalendar, type CalendarView } from "./work-shift-calendar.utils";
import { groupTrackingHistory, summarizeTracking, trackingPeriod } from "./work-shift-details.utils";

export function WorkShiftTracking() {
  const { session, calendar, employees, employeeId, canReadAll, now, today, timeZone, view, setView,
    anchor, navigateDate, setSection, loading, assignmentBusy } = useWorkShifts();
  const person = canReadAll ? employees.find((item) => String(item.id) === employeeId) : session?.employee;
  const period = trackingPeriod(anchor, view);
  const summary = useMemo(() => calendar ? summarizeTracking(calendar, anchor, view, timeZone, now) : null,
    [calendar, anchor, view, timeZone, now]);
  const history = useMemo(() => calendar ? groupTrackingHistory(calendar, anchor, view, timeZone) : [],
    [calendar, anchor, view, timeZone]);
  const plannedDays = history.filter((day) => day.date >= period.from && day.date <= period.to &&
    (day.shifts.some((shift) => shift.status !== "CANCELLED") || day.nonWorkingDays.some((item) => item.isActive))).length;
  const metrics = summary ? [
    { label: "Horas previstas", value: formatMinutes(summary.plannedMinutes) },
    { label: "Horas registradas", value: formatMinutes(summary.recordedMinutes) },
    { label: "Jornadas finalizadas", value: String(summary.completed) },
    { label: "Sin entrada registrada", value: String(summary.missingEntries) },
    { label: "Llegadas tarde", value: String(summary.late) },
    { label: "Salidas anticipadas", value: String(summary.early) },
  ] : [];
  return <View className="gap-4">
    <View style={{ zIndex: 20 }} className="flex-row items-center gap-2">
      <Text className="flex-1 text-xl font-bold text-gray-950 dark:text-white">{person?.name ?? "Seguimiento laboral"}</Text>
      <InfoHint label="Cómo se calcula el seguimiento" text="Las horas previstas incluyen el bloque completo. Las registradas usan fichajes con entrada y salida cerradas y se limitan al período elegido. No se descuentan descansos ni se calculan sueldos. Sin entrada registrada no confirma una ausencia. La llegada se marca tarde solo si supera la tolerancia guardada en esa jornada. El retraso mostrado se cuenta desde el inicio previsto. Las salidas anticipadas no usan tolerancia. Los minutos se redondean hacia arriba." />
    </View>
    <View className="flex-row rounded-full bg-gray-200 p-1 dark:bg-gray-800">
      {([{ value: "month", label: "Mes" }, { value: "week", label: "Semana" }] as { value: CalendarView; label: string }[]).map((option) =>
        <Pressable key={option.value} disabled={assignmentBusy} accessibilityRole="radio" accessibilityState={{ checked: view === option.value }}
          onPress={() => setView(option.value)} className={`min-h-11 flex-1 items-center justify-center rounded-full ${view === option.value ? "bg-emerald-600" : ""}`}>
          <Text className={`font-semibold ${view === option.value ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>{option.label}</Text>
        </Pressable>)}
    </View>
    <View className="flex-row items-center gap-2">
      <Pressable disabled={assignmentBusy} accessibilityRole="button" accessibilityLabel="Período anterior"
        onPress={() => navigateDate(moveCalendar(anchor, view, -1))} className="h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-gray-900">
        <Ionicons name="chevron-back" size={22} color="#059669" />
      </Pressable>
      <Text className="flex-1 text-center text-lg font-bold capitalize text-gray-950 dark:text-white">{period.title}</Text>
      <Pressable disabled={assignmentBusy} accessibilityRole="button" accessibilityLabel="Período siguiente"
        onPress={() => navigateDate(moveCalendar(anchor, view, 1))} className="h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-gray-900">
        <Ionicons name="chevron-forward" size={22} color="#059669" />
      </Pressable>
    </View>
    <Pressable disabled={assignmentBusy} accessibilityRole="button" onPress={() => navigateDate(today)} className="self-center rounded-full bg-emerald-100 px-5 py-2 dark:bg-emerald-950">
      <Text className="font-semibold text-emerald-700 dark:text-emerald-300">Período actual</Text>
    </Pressable>
    {loading && <ActivityIndicator size="small" color="#059669" />}
    {summary && <>
      <View className="flex-row flex-wrap gap-3">
        {metrics.map((item) => <View key={item.label} style={{ width: "47%" }} className="gap-2 rounded-2xl bg-white p-4 dark:bg-gray-900">
          <Text className="text-xs text-gray-500 dark:text-gray-400">{item.label}</Text>
          <Text className="text-xl font-bold text-gray-950 dark:text-white">{item.value}</Text>
        </View>)}
      </View>
      <Text className="text-sm text-gray-600 dark:text-gray-300">Días con planificación: {plannedDays}/{period.dates.length}</Text>
      <View className="flex-row items-center gap-2">
        <Ionicons name="time-outline" size={22} color="#059669" />
        <Text className="text-lg font-bold text-gray-950 dark:text-white">Historial del período</Text>
      </View>
      {history.map((day) => <View key={day.date} className="gap-3 rounded-3xl border border-gray-200 bg-gray-100 p-3 dark:border-gray-700 dark:bg-gray-950">
        <Text className="px-1 font-bold capitalize text-gray-950 dark:text-white">{dateLabel(day.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</Text>
        {day.date < period.from && <Text className="px-1 text-xs text-gray-500 dark:text-gray-400">Jornada que comenzó antes del período y continúa dentro de él.</Text>}
        {day.shifts.map((shift) => <WorkShiftCard key={shift.id} shift={shift} readOnly showDate={false} />)}
        {day.nonWorkingDays.map((dayOff) => <NonWorkingDayCard key={dayOff.id} day={dayOff} readOnly />)}
      </View>)}
      {!history.length && <View className="items-center gap-2 rounded-2xl bg-white p-8 dark:bg-gray-900">
        <Ionicons name="calendar-outline" size={30} color="#64748B" />
        <Text className="text-center text-gray-500 dark:text-gray-400">No hay jornadas asignadas para este período.</Text>
      </View>}
      <AuthButton label="Ver en calendario" secondary onPress={() => setSection("calendar")} />
    </>}
  </View>;
}
