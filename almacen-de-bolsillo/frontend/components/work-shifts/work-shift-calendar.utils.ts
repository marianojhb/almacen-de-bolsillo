import {
  addCalendarDays, createWorkShiftAssignmentDrafts, findCalendarDraftConflicts, findNonWorkingDayConflicts, findWorkShiftConflicts,
  getNonWorkingDayInterval, getWorkShiftDays, getWorkShiftLocalFields, isWorkShiftTime,
  type WorkShiftAssignmentDraft, type WorkShiftAssignmentBatchDto, type WorkShiftCalendarDto,
  type EmployeeNonWorkingDayDto, type WorkShiftBreakInput, type WorkShiftDto, type WorkShiftTimeBlock, type WorkShiftTypeDto,
} from "@almacen/shared";
import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

export type CalendarView = "month" | "week";
export type WorkShiftSection = "calendar" | "types" | "tracking";
export type ShiftIcon = ComponentProps<typeof Ionicons>["name"];
export const SHIFT_ICONS: ShiftIcon[] = ["sunny-outline", "partly-sunny-outline", "moon-outline", "bed-outline", "airplane-outline", "calendar-outline", "briefcase-outline", "cafe-outline", "home-outline", "heart-outline", "star-outline", "time-outline"];
export const SHIFT_COLORS = ["#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED", "#DB2777", "#0891B2", "#475569"];
export const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export type PendingAssignment = { date: string; type: WorkShiftTypeDto };

export function shiftIcon(value: string | null): ShiftIcon {
  return value && SHIFT_ICONS.includes(value as ShiftIcon) ? value as ShiftIcon : "calendar-outline";
}

export function dateLabel(day: string, options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }) {
  // Las fechas de calendario no son instantes: evitar desplazarlas por la zona del dispositivo.
  return new Intl.DateTimeFormat("es-AR", { ...options, timeZone: "UTC" }).format(new Date(`${day}T12:00:00.000Z`));
}

export function startOfWeek(day: string) {
  const weekday = new Date(`${day}T12:00:00.000Z`).getUTCDay();
  return addCalendarDays(day, -((weekday + 6) % 7));
}

export function calendarDays(anchor: string, view: CalendarView) {
  if (view === "week") {
    const start = startOfWeek(anchor);
    return getWorkShiftDays(start, addCalendarDays(start, 6));
  }
  const start = startOfWeek(`${anchor.slice(0, 7)}-01`);
  const month = new Date(`${anchor.slice(0, 7)}-01T12:00:00.000Z`);
  month.setUTCMonth(month.getUTCMonth() + 1);
  const end = addCalendarDays(startOfWeek(addCalendarDays(month.toISOString().slice(0, 10), -1)), 6);
  return getWorkShiftDays(start, end);
}

export function moveCalendar(anchor: string, view: CalendarView, direction: number) {
  if (view === "week") return addCalendarDays(anchor, direction * 7);
  const date = new Date(`${anchor.slice(0, 7)}-01T12:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + direction);
  return date.toISOString().slice(0, 10);
}

// El rango de consulta conserva semanas completas; la grilla mensual oculta los días de otros meses.
export function calendarCells(anchor: string, view: CalendarView): (string | null)[] {
  return calendarDays(anchor, view).map((day) => view === "month" && day.slice(0, 7) !== anchor.slice(0, 7) ? null : day);
}

export function assignmentDrafts(type: WorkShiftTypeDto | undefined, dates: string[], timeZone: string) {
  if (!type?.isActive || !dates.length) return { drafts: [], error: null };
  try {
    return { drafts: createWorkShiftAssignmentDrafts(type, dates, timeZone), error: null };
  } catch (reason) {
    return { drafts: [], error: reason instanceof Error ? reason.message : "Revisá las fechas de la asignación." };
  }
}

export function pendingAssignmentDrafts(assignments: PendingAssignment[], timeZone: string) {
  try {
    const drafts = assignments.flatMap((item) => createWorkShiftAssignmentDrafts(item.type, [item.date], timeZone));
    return { drafts, error: null };
  } catch (reason) {
    return { drafts: [], error: reason instanceof Error ? reason.message : "Revisá las asignaciones." };
  }
}

export function groupAssignments(employeeId: number, pending: PendingAssignment[]): WorkShiftAssignmentBatchDto {
  const assignments: WorkShiftAssignmentBatchDto["assignments"] = [];
  for (const item of pending) {
    let group = assignments.find((entry) => entry.workShiftTypeId === item.type.id);
    if (!group) {
      group = { workShiftTypeId: item.type.id, expectedTypeUpdatedAt: item.type.updatedAt, dates: [] };
      assignments.push(group);
    }
    if (group.expectedTypeUpdatedAt !== item.type.updatedAt) throw new Error("Una jornada cambió mientras editabas. Quitá sus asignaciones pendientes y volvé a elegirla.");
    group.dates.push(item.date);
  }
  return { employeeId, assignments };
}

export function calendarAssignmentConflicts(drafts: WorkShiftAssignmentDraft[], calendar: WorkShiftCalendarDto, timeZone: string) {
  const timed = drafts.map((draft) => {
    const interval = draft.kind === "NON_WORKING_DAY" ? getNonWorkingDayInterval(draft, timeZone) : { startsAt: new Date(draft.startsAt!), endsAt: new Date(draft.endsAt!) };
    return { date: draft.date, startsAt: interval.startsAt.toISOString(), endsAt: interval.endsAt.toISOString() };
  });
  const saved = findWorkShiftConflicts(timed, calendar.shifts.filter((shift) => shift.status !== "CANCELLED"))
    .filter((conflict) => conflict.existingShiftId !== null);
  return [...findCalendarDraftConflicts(drafts, timeZone), ...saved, ...findNonWorkingDayConflicts(drafts, calendar.nonWorkingDays, timeZone)];
}

export function automaticTimeBlock(startTime: string, endTime: string, keepFullDay = false): WorkShiftTimeBlock {
  if (!isWorkShiftTime(startTime) || !isWorkShiftTime(endTime)) throw new Error("Elegí un horario de inicio y fin válidos.");
  if (startTime === endTime && !keepFullDay) throw new Error("Inicio y fin deben ser distintos.");
  return { startTime, endTime, endsNextDay: endTime < startTime || (startTime === endTime && keepFullDay) };
}

export function automaticBreakDays(block: WorkShiftTimeBlock, breaks: WorkShiftBreakInput[]): WorkShiftBreakInput[] {
  return breaks.map((item) => {
    if (item.mode === "FLEXIBLE") return item;
    return { ...item,
      startsNextDay: !!block.endsNextDay && item.startTime < block.startTime,
      endsNextDay: !!block.endsNextDay && item.endTime <= block.startTime,
    };
  });
}

export function shiftTouchesDay(shift: Pick<WorkShiftDto, "startsAt" | "endsAt">, day: string, timeZone: string) {
  const start = getWorkShiftLocalFields(shift.startsAt, timeZone).date;
  const end = getWorkShiftLocalFields(new Date(Date.parse(shift.endsAt) - 1), timeZone).date;
  return start <= day && end >= day;
}

export function dayOffTouchesDay(dayOff: EmployeeNonWorkingDayDto, day: string, _timeZone: string) {
  return dayOff.date === day;
}

// Convertir los extremos locales una vez por registro, no otra vez por cada celda del mes.
export function groupCalendarEntries(days: string[], calendar: WorkShiftCalendarDto | null, drafts: WorkShiftAssignmentDraft[], timeZone: string) {
  const grouped = new Map(days.map((day) => [day, {
    shifts: [] as WorkShiftDto[], offDays: [] as EmployeeNonWorkingDayDto[], drafts: [] as WorkShiftAssignmentDraft[],
  }]));
  const range = (item: { startsAt: string; endsAt: string }) => ({
    first: getWorkShiftLocalFields(item.startsAt, timeZone).date,
    last: getWorkShiftLocalFields(new Date(Date.parse(item.endsAt) - 1), timeZone).date,
  });
  for (const shift of calendar?.shifts ?? []) {
    const { first, last } = range(shift);
    for (const day of days) if (day >= first && day <= last) grouped.get(day)!.shifts.push(shift);
  }
  for (const item of calendar?.nonWorkingDays ?? []) {
    const first = item.date;
    const last = item.date;
    for (const day of days) if (day >= first && day <= last) grouped.get(day)!.offDays.push(item);
  }
  for (const draft of drafts) {
    const { first, last } = draft.kind === "NON_WORKING_DAY" || !draft.startsAt || !draft.endsAt
      ? { first: draft.date, last: draft.date } : range({ startsAt: draft.startsAt, endsAt: draft.endsAt });
    for (const day of days) if (day >= first && day <= last) grouped.get(day)!.drafts.push(draft);
  }
  return grouped;
}

export function shiftStatus(shift: WorkShiftDto, now: number) {
  if (shift.status === "CANCELLED") return { label: "Cancelado", icon: "close-circle-outline" as ShiftIcon, color: "#6B7280" };
  if (shift.status === "COMPLETED") return { label: "Finalizado", icon: "checkmark-circle-outline" as ShiftIcon, color: "#059669" };
  if (shift.status === "IN_PROGRESS") return { label: now >= Date.parse(shift.endsAt) ? "En curso · salida pendiente" : "En curso", icon: "play-circle-outline" as ShiftIcon, color: "#2563EB" };
  if (now >= Date.parse(shift.endsAt)) return { label: "Sin entrada registrada", icon: "alert-circle-outline" as ShiftIcon, color: "#D97706" };
  if (now >= Date.parse(shift.startsAt)) return { label: "Entrada pendiente", icon: "time-outline" as ShiftIcon, color: "#D97706" };
  return { label: "Programado", icon: "time-outline" as ShiftIcon, color: "#6B7280" };
}

export function formatMinutes(minutes: number) {
  const rounded = Math.max(0, Math.round(minutes));
  return `${Math.floor(rounded / 60)} h ${rounded % 60} min`;
}

export function attendanceMinutes(shift: WorkShiftDto) {
  if (!shift.actualStartedAt || !shift.actualEndedAt) return 0;
  return Math.max(0, (Date.parse(shift.actualEndedAt) - Date.parse(shift.actualStartedAt)) / 60000);
}

export function plannedBreakMinutes(shift: WorkShiftDto) {
  return shift.breaks.reduce((total, item) => total + (item.durationMinutes ?? (item.startsAt && item.endsAt ? (Date.parse(item.endsAt) - Date.parse(item.startsAt)) / 60000 : 0)), 0);
}
