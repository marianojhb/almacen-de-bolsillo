import { addCalendarDays } from "../commerce/commerce-format.js";
import type { WorkShiftConflict, WorkShiftDraft, WorkShiftTimeBlock } from "./work-shift.types.js";

export const MAX_WORK_SHIFT_DAYS = 92;

export function isWorkShiftDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1900-01-01" || value > "9999-12-30") return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isWorkShiftTime(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function getWorkShiftDays(from: string, to: string): string[] {
  if (!isWorkShiftDate(from) || !isWorkShiftDate(to) || from > to) throw new Error("El rango de fechas no es válido.");
  const count = (Date.parse(`${to}T00:00:00.000Z`) - Date.parse(`${from}T00:00:00.000Z`)) / 86400000 + 1;
  if (count > MAX_WORK_SHIFT_DAYS) throw new Error(`Elegí un rango de hasta ${MAX_WORK_SHIFT_DAYS} días.`);
  return Array.from({ length: count }, (_, index) => addCalendarDays(from, index));
}

export function getWorkShiftLocalFields(value: string | Date, timeZone: string) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(value)).map((part) => [part.type, part.value]));
  return { date: `${parts.year.padStart(4, "0")}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

// Resolver la hora escrita en el comercio, no en la zona horaria de la PC.
// Se rechazan horas inexistentes o repetidas durante cambios de horario de verano.
export function workShiftLocalToDate(day: string, time: string, timeZone: string): Date {
  if (!isWorkShiftDate(day) || !isWorkShiftTime(time)) throw new Error("La fecha o el horario no son válidos.");
  const target = Date.parse(`${day}T${time}:00.000Z`);
  const offsets = new Set<number>();
  for (const hours of [-36, -24, -12, 0, 12, 24, 36]) {
    const sample = new Date(target + hours * 3600000);
    const local = getWorkShiftLocalFields(sample, timeZone);
    offsets.add(Date.parse(`${local.date}T${local.time}:00.000Z`) - sample.getTime());
  }
  const candidates = [...offsets].map((offset) => new Date(target - offset)).filter((date) => {
    const local = getWorkShiftLocalFields(date, timeZone);
    return local.date === day && local.time === time;
  });
  if (!candidates.length) throw new Error(`El horario ${day} ${time} no existe en la zona del comercio por un cambio horario.`);
  if (candidates.length > 1) throw new Error(`El horario ${day} ${time} se repite por un cambio horario. Elegí otro horario para ese día.`);
  return candidates[0]!;
}

export function createWorkShiftDraft(day: string, block: WorkShiftTimeBlock, timeZone: string): WorkShiftDraft {
  if (!isWorkShiftDate(day) || !isWorkShiftTime(block.startTime) || !isWorkShiftTime(block.endTime)) {
    throw new Error("La fecha o el horario no son válidos.");
  }
  const duration = Date.parse(`${day}T${block.endTime}:00.000Z`) - Date.parse(`${day}T${block.startTime}:00.000Z`)
    + (block.endsNextDay ? 86400000 : 0);
  if (duration <= 0 || duration > 86400000) throw new Error("El fin debe ser posterior al inicio y el turno no puede superar 24 horas de calendario.");
  const startsAt = workShiftLocalToDate(day, block.startTime, timeZone);
  const endsAt = workShiftLocalToDate(block.endsNextDay ? addCalendarDays(day, 1) : day, block.endTime, timeZone);
  if (endsAt <= startsAt) throw new Error("El fin del turno debe ser posterior al inicio.");
  return { date: day, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() };
}

type ShiftInterval = { startsAt: string | Date; endsAt: string | Date };
export function workShiftsOverlap(first: ShiftInterval, second: ShiftInterval): boolean {
  return new Date(first.startsAt).getTime() < new Date(second.endsAt).getTime()
    && new Date(second.startsAt).getTime() < new Date(first.endsAt).getTime();
}

export function isWorkShiftInPast(endsAt: string | Date, now: number | Date = Date.now()): boolean {
  return (now instanceof Date ? now.getTime() : now) >= (endsAt instanceof Date ? endsAt.getTime() : Date.parse(endsAt));
}

export function findWorkShiftConflicts(drafts: WorkShiftDraft[], existing: (ShiftInterval & { id: number })[]): WorkShiftConflict[] {
  const conflicts: WorkShiftConflict[] = [];
  drafts.forEach((draft, draftIndex) => {
    for (const shift of existing) {
      if (workShiftsOverlap(draft, shift)) conflicts.push({ draftIndex, existingShiftId: shift.id, otherDraftIndex: null, message: "Se superpone con un turno existente del empleado." });
    }
    drafts.slice(0, draftIndex).forEach((other, otherDraftIndex) => {
      if (workShiftsOverlap(draft, other)) conflicts.push({ draftIndex, existingShiftId: null, otherDraftIndex, message: "Se superpone con otro bloque de esta carga." });
    });
  });
  return conflicts;
}

/** Superar el margen marca tardanza; se informa el retraso completo desde el inicio previsto. */
export function getWorkShiftLateMinutes(shift: {
  startsAt: string; actualStartedAt: string | null; lateToleranceMinutes?: number;
}): number {
  if (!shift.actualStartedAt) return 0;
  const delay = Date.parse(shift.actualStartedAt) - Date.parse(shift.startsAt);
  return delay > (shift.lateToleranceMinutes ?? 0) * 60000 ? Math.ceil(delay / 60000) : 0;
}
