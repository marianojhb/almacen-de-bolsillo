import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { AuthButton } from "@/components/auth/AuthButton";
import { SearchSelect } from "@/components/forms/SearchSelect";
import { useWorkShifts } from "@/contexts/work-shifts";
import { CalendarBoard } from "./calendar/CalendarBoard";
import { AssignmentPanel } from "./calendar/AssignmentPanel";
import { AssignmentReview } from "./calendar/AssignmentReview";
import { NonWorkingDayCard } from "./NonWorkingDayCard";
import { WorkShiftCard } from "./WorkShiftCard";
import { WorkShiftTracking } from "./WorkShiftTracking";
import { WorkShiftTypes } from "./WorkShiftTypes";
import { dateLabel, dayOffTouchesDay, shiftTouchesDay, type ShiftIcon, type WorkShiftSection } from "./work-shift-calendar.utils";

export function WorkShiftsScreen() {
  const { session, section, setSection, canReadAll, canManage, timeZone, employees, employeeId, changeEmployee,
    editing, calendar, selectedDay, dayDetailsOpen, setDayDetailsOpen, assignmentBusy, assignmentNotice,
    loading, calendarError, optionsError, refreshCalendar, refreshOptions } = useWorkShifts();
  const [refreshing, setRefreshing] = useState(false);
  const focusedOnce = useRef(false);
  const refreshRef = useRef({ refreshCalendar, refreshOptions });
  refreshRef.current = { refreshCalendar, refreshOptions };
  useFocusEffect(useCallback(() => {
    if (focusedOnce.current) { void refreshRef.current.refreshCalendar(); void refreshRef.current.refreshOptions(); }
    focusedOnce.current = true;
  }, []));
  const refresh = async () => {
    setRefreshing(true);
    try { await Promise.all([refreshCalendar(), refreshOptions()]); }
    finally { setRefreshing(false); }
  };
  const sections: { value: WorkShiftSection; label: string; icon: ShiftIcon }[] = [
    { value: "calendar", label: "Calendario", icon: "calendar-outline" },
    ...(canReadAll ? [{ value: "types" as const, label: "Jornadas", icon: "briefcase-outline" as const }] : []),
    { value: "tracking", label: "Seguimiento", icon: "time-outline" },
  ];
  const noOwnEmployee = !canReadAll && !session?.employee;
  const needsEmployee = canReadAll && !employeeId && section !== "types";
  const shifts = useMemo(() => !editing && dayDetailsOpen
    ? (calendar?.shifts ?? []).filter((shift) => shiftTouchesDay(shift, selectedDay, timeZone)).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    : [], [calendar, selectedDay, timeZone, editing, dayDetailsOpen]);
  const offDays = useMemo(() => !editing && dayDetailsOpen
    ? (calendar?.nonWorkingDays ?? []).filter((day) => dayOffTouchesDay(day, selectedDay, timeZone))
    : [], [calendar, selectedDay, timeZone, editing, dayDetailsOpen]);
  const employeeOptions = employees.map((person) => ({ value: String(person.id), label: person.name }));
  employeeOptions.unshift({ value: "", label: "Ninguno" });

  return <View className="flex-1 bg-gray-50 dark:bg-black"><ScrollView className="flex-1" contentContainerClassName="gap-5 p-4 pb-10"
    refreshControl={<RefreshControl refreshing={refreshing} enabled={!assignmentBusy} onRefresh={() => { if (!assignmentBusy) void refresh(); }} />} keyboardShouldPersistTaps="handled">
    <View className="flex-row items-center gap-3">
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950"><Ionicons name="calendar-outline" size={26} color="#059669" /></View>
      <Text className="flex-1 text-2xl font-bold text-gray-950 dark:text-white">{canReadAll ? "Turnos laborales" : "Mis turnos"}</Text>
    </View>
    <View className="flex-row rounded-2xl bg-white p-1 dark:bg-gray-900">
      {sections.map((item) => <Pressable key={item.value} disabled={assignmentBusy} onPress={() => setSection(item.value)} accessibilityRole="radio" accessibilityState={{ checked: section === item.value }}
        className={`min-h-16 flex-1 items-center justify-center gap-1 rounded-xl px-1 ${section === item.value ? "bg-emerald-50 dark:bg-emerald-950" : ""}`}>
        <Ionicons name={item.icon} size={21} color={section === item.value ? "#059669" : "#64748B"} />
        <Text className={`text-center text-xs font-semibold ${section === item.value ? "text-emerald-700 dark:text-emerald-300" : "text-gray-500 dark:text-gray-400"}`}>{item.label}</Text>
      </Pressable>)}
    </View>
    {optionsError && <View className="gap-3 rounded-xl border border-red-300 p-3 dark:border-red-900">
      <Text accessibilityRole="alert" className="text-red-600 dark:text-red-400">{optionsError}</Text>
      <AuthButton label="Reintentar opciones" secondary onPress={() => void refreshOptions()} />
    </View>}
    {canReadAll && section !== "types" && <SearchSelect label="Empleado" value={employeeId} options={employeeOptions} onChange={changeEmployee} disabled={assignmentBusy} placeholder="Ninguno" />}
    {!canReadAll && session?.employee && <Text className="font-semibold text-gray-950 dark:text-white">{session.employee.name}</Text>}
    {noOwnEmployee && <View className="gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
      <Text className="font-semibold text-amber-950 dark:text-amber-100">Tu cuenta no tiene un empleado vinculado.</Text>
      <Text className="text-sm text-amber-900 dark:text-amber-200">El administrador puede vincularlo desde Usuarios. Después podrás consultar tus turnos y registrar entrada y salida. Tus otros permisos no cambian.</Text>
    </View>}
    {section === "types" && canReadAll && <WorkShiftTypes />}
    {section !== "types" && !noOwnEmployee && <>
      {calendarError && <View className="gap-3">
        <Text accessibilityRole="alert" className="text-red-600 dark:text-red-400">{calendarError}</Text>
        <AuthButton label="Reintentar calendario" secondary onPress={() => void refreshCalendar()} />
      </View>}
      {needsEmployee && <View className="items-center gap-3 rounded-3xl border border-dashed border-gray-300 bg-white px-5 py-12 dark:border-gray-700 dark:bg-gray-900">
        <Ionicons name="person-outline" size={36} color="#64748B" />
        <Text className="text-center font-semibold text-gray-700 dark:text-gray-200">No hay un empleado seleccionado</Text>
        <Text className="text-center text-sm text-gray-500 dark:text-gray-400">Elegí uno para consultar sus jornadas.</Text>
      </View>}
      {!needsEmployee && section === "calendar" && <>
        <CalendarBoard />
        <AssignmentReview />
        {assignmentNotice && <View accessibilityRole="alert" className="flex-row items-center gap-2 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
          <Ionicons name="checkmark-circle-outline" size={20} color="#059669" />
          <Text className="flex-1 text-sm text-emerald-800 dark:text-emerald-200">{assignmentNotice}</Text>
        </View>}
        {!editing && dayDetailsOpen && calendar && !loading && <View className="gap-4">
          <View className="flex-row items-center gap-2">
            <Text className="flex-1 text-lg font-bold text-gray-950 dark:text-white">{dateLabel(selectedDay, { weekday: "long", day: "numeric", month: "long" })}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar detalle del día" onPress={() => setDayDetailsOpen(false)} className="h-11 w-11 items-center justify-center">
              <Ionicons name="close-circle-outline" size={24} color="#64748B" />
            </Pressable>
          </View>
          {shifts.map((shift) => <WorkShiftCard key={shift.id} shift={shift} />)}
          {offDays.map((day) => <NonWorkingDayCard key={day.id} day={day} />)}
          {!shifts.length && !offDays.length && <Text className="text-gray-500 dark:text-gray-400">No hay jornadas asignadas para este día. Un día vacío no se considera automáticamente día de descanso.</Text>}
        </View>}
      </>}
      {!needsEmployee && section === "tracking" && <WorkShiftTracking />}
    </>}
  </ScrollView>
    {canManage && section === "calendar" && !needsEmployee && !noOwnEmployee &&
      <View className={`px-4 pb-3 pt-2 ${editing ? "border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-black" : ""}`}>
        <AssignmentPanel />
      </View>}
  </View>;
}
