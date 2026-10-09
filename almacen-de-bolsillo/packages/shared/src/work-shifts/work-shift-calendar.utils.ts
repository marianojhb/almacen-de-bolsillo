import { addCalendarDays, getCommerceDayStart } from "../commerce/commerce-format.js";
import { createWorkShiftDraft, findWorkShiftConflicts, getWorkShiftDays, isWorkShiftDate, isWorkShiftTime, workShiftLocalToDate, workShiftsOverlap } from "./work-shift.utils.js";
import type { WorkShiftAssignmentDraft, WorkShiftAssignmentDto, WorkShiftBreakDraft, WorkShiftBreakInput, WorkShiftConflict, WorkShiftTimeBlock, WorkShiftTypeData } from "./work-shift.types.js";

const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const offset = (time: string, nextDay = false) => minutes(time) + (nextDay ? 1440 : 0);

export function validateWorkShiftBreaks(block: WorkShiftTimeBlock, breaks: WorkShiftBreakInput[]): void {
  if (!isWorkShiftTime(block.startTime) || !isWorkShiftTime(block.endTime)) throw new Error("Los horarios deben tener formato HH:mm.");
  const start = minutes(block.startTime);
  const end = offset(block.endTime, block.endsNextDay);
  if (end <= start || end - start > 1440) throw new Error("El turno debe durar más de cero y hasta 24 horas de calendario.");
  if (breaks.length > 8) throw new Error("La jornada puede tener hasta ocho descansos.");
  const fixed: { startsAt: number; endsAt: number }[] = [];
  let total = 0;
  for (const item of breaks) {
    if (item.mode === "FLEXIBLE") {
      if (!Number.isInteger(item.durationMinutes) || item.durationMinutes <= 0 || item.durationMinutes > 1440) throw new Error("La duración del descanso debe ser una cantidad positiva de minutos.");
      total += item.durationMinutes;
    } else {
      if (!isWorkShiftTime(item.startTime) || !isWorkShiftTime(item.endTime)) throw new Error("El descanso fijo necesita horarios HH:mm válidos.");
      const from = offset(item.startTime, item.startsNextDay);
      const to = offset(item.endTime, item.endsNextDay);
      if (from < start || to > end || to <= from) throw new Error("El descanso fijo debe estar dentro de la jornada y terminar después de su inicio.");
      if (fixed.some((other) => from < other.endsAt && to > other.startsAt)) throw new Error("Los descansos fijos no pueden superponerse.");
      fixed.push({ startsAt: from, endsAt: to });
      total += to - from;
    }
  }
  if (total >= end - start) throw new Error("Los descansos deben dejar tiempo de trabajo dentro de la jornada.");
}

export function validateWorkShiftType(data: WorkShiftTypeData): void {
  const tolerance = data.lateToleranceMinutes ?? 0;
  if (!Number.isInteger(tolerance) || tolerance < 0 || tolerance > 1440) throw new Error("La tolerancia debe ser una cantidad entera de entre 0 y 1440 minutos.");
  if (!data.isWorkingDay && tolerance !== 0) throw new Error("Los días no laborables no tienen tolerancia de llegada.");
  if (!data.isWorkingDay) {
    if (data.startTime !== null || data.endTime !== null || data.endsNextDay) throw new Error("Un día completo no debe tener horarios ni finalizar al día siguiente.");
  } else {
    if (data.startTime === null || data.endTime === null) throw new Error("Indicá el inicio y fin de la jornada.");
    validateWorkShiftBreaks({ startTime: data.startTime, endTime: data.endTime, endsNextDay: data.endsNextDay }, data.breaks);
    if (tolerance >= offset(data.endTime, data.endsNextDay) - minutes(data.startTime)) throw new Error("La tolerancia debe ser menor que la duración de la jornada.");
  }
  if (!data.isWorkingDay && data.breaks.length) throw new Error("Los días no laborables no tienen descansos de trabajo.");
}

export function createWorkShiftBreakDrafts(day: string, block: WorkShiftTimeBlock, breaks: WorkShiftBreakInput[], timeZone: string): WorkShiftBreakDraft[] {
  validateWorkShiftBreaks(block, breaks);
  const shift = createWorkShiftDraft(day, block, timeZone);
  const drafts = breaks.map((item): WorkShiftBreakDraft => item.mode === "FLEXIBLE"
    ? { mode: item.mode, durationMinutes: item.durationMinutes, startsAt: null, endsAt: null }
    : { mode: item.mode, durationMinutes: null,
      startsAt: workShiftLocalToDate(item.startsNextDay ? addCalendarDays(day, 1) : day, item.startTime, timeZone).toISOString(),
      endsAt: workShiftLocalToDate(item.endsNextDay ? addCalendarDays(day, 1) : day, item.endTime, timeZone).toISOString() });
  const total = drafts.reduce((sum, item) => sum + (item.mode === "FLEXIBLE" ? item.durationMinutes! * 60000 : Date.parse(item.endsAt!) - Date.parse(item.startsAt!)), 0);
  if (total >= Date.parse(shift.endsAt) - Date.parse(shift.startsAt)) throw new Error("Los descansos superan el tiempo disponible en esta fecha por el cambio horario.");
  return drafts;
}

export function getWorkShiftAssignmentDates(data: WorkShiftAssignmentDto): string[] {
  if (data.dates !== undefined) {
    if (data.from !== undefined || data.to !== undefined || data.weekdays !== undefined) throw new Error("Elegí fechas individuales o un rango, no ambos.");
    if (!data.dates.length || data.dates.length > 92 || data.dates.some((day) => !isWorkShiftDate(day))) throw new Error("Seleccioná entre una y 92 fechas válidas.");
    if (new Set(data.dates).size !== data.dates.length) throw new Error("No se pueden repetir fechas.");
    const dates = [...data.dates].sort();
    getWorkShiftDays(dates[0]!, dates[dates.length - 1]!);
    return dates;
  }
  if (data.from === undefined || data.to === undefined) throw new Error("Indicá fechas individuales o el inicio y fin del rango.");
  if (data.weekdays !== undefined && (!data.weekdays.length || data.weekdays.length > 7 || new Set(data.weekdays).size !== data.weekdays.length
    || data.weekdays.some((day) => !Number.isInteger(day) || day < 0 || day > 6))) throw new Error("Seleccioná días de la semana válidos sin repetirlos.");
  const dates = getWorkShiftDays(data.from, data.to).filter((day) => data.weekdays === undefined || data.weekdays.includes(new Date(`${day}T12:00:00.000Z`).getUTCDay()));
  if (!dates.length) throw new Error("No hay días seleccionados dentro del rango.");
  return dates;
}

export function createWorkShiftAssignmentDrafts(type: WorkShiftTypeData & { id: number }, dates: string[], timeZone: string): WorkShiftAssignmentDraft[] {
  validateWorkShiftType(type);
  return dates.map((date): WorkShiftAssignmentDraft => {
    if (!isWorkShiftDate(date)) throw new Error("La fecha no es válida.");
    // Comprobar también que el día completo exista en la zona del comercio.
    if (!type.isWorkingDay) getCommerceDayStart(date, timeZone);
    const block = !type.isWorkingDay ? null : { startTime: type.startTime!, endTime: type.endTime!, endsNextDay: type.endsNextDay };
    const timed = block ? createWorkShiftDraft(date, block, timeZone) : null;
    return { kind: type.isWorkingDay ? "WORK_SHIFT" : "NON_WORKING_DAY", workShiftTypeId: type.id, date,
      lateToleranceMinutes: type.isWorkingDay ? type.lateToleranceMinutes ?? 0 : 0,
      name: type.name, icon: type.icon, iconColor: type.iconColor ?? "#FFFFFF", color: type.color, allDay: !type.isWorkingDay,
      startsAt: timed?.startsAt ?? null, endsAt: timed?.endsAt ?? null,
      breaks: block && type.isWorkingDay ? createWorkShiftBreakDrafts(date, block, type.breaks, timeZone) : [] };
  });
}

export type NonWorkingDayInterval = { id: number; date: string; isActive: boolean };
type CalendarDraftInterval = { date: string; startsAt: string | null; endsAt: string | null; allDay?: boolean; kind?: "WORK_SHIFT" | "NON_WORKING_DAY" };

export function getNonWorkingDayInterval(day: { date: string }, timeZone: string) {
  return { startsAt: getCommerceDayStart(day.date, timeZone), endsAt: getCommerceDayStart(addCalendarDays(day.date, 1), timeZone) };
}

export function findNonWorkingDayConflicts(drafts: CalendarDraftInterval[], days: NonWorkingDayInterval[], timeZone: string): WorkShiftConflict[] {
  const conflicts: WorkShiftConflict[] = [];
  drafts.forEach((draft, draftIndex) => {
    const interval = draft.kind === "NON_WORKING_DAY" ? getNonWorkingDayInterval(draft, timeZone)
      : { startsAt: draft.startsAt!, endsAt: draft.endsAt! };
    for (const day of days) {
      if (day.isActive && workShiftsOverlap(interval, getNonWorkingDayInterval(day, timeZone))) {
        conflicts.push({ draftIndex, existingShiftId: null, otherDraftIndex: null, existingNonWorkingDayId: day.id,
          message: "El empleado tiene un día no laboral en esa fecha." });
      }
    }
  });
  return conflicts;
}

export function findCalendarDraftConflicts(drafts: CalendarDraftInterval[], timeZone: string): WorkShiftConflict[] {
  const timed = drafts.map((draft) => {
    const interval = draft.kind === "NON_WORKING_DAY" ? getNonWorkingDayInterval(draft, timeZone)
      : { startsAt: new Date(draft.startsAt!), endsAt: new Date(draft.endsAt!) };
    return { date: draft.date, startsAt: interval.startsAt.toISOString(), endsAt: interval.endsAt.toISOString() };
  });
  return findWorkShiftConflicts(timed, []).map((conflict) => ({ ...conflict,
    message: drafts[conflict.draftIndex]?.kind === "NON_WORKING_DAY" || (conflict.otherDraftIndex !== null && drafts[conflict.otherDraftIndex]?.kind === "NON_WORKING_DAY")
      ? "Un día no laboral no puede compartir fecha con jornadas laborales."
      : "Las jornadas seleccionadas se superponen.",
  }));
}
