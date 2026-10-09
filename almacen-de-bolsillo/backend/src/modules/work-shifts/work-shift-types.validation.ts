import {
  getWorkShiftAssignmentDates, getWorkShiftDays, isWorkShiftDate, isWorkShiftTime, validateWorkShiftType,
  type UpdateNonWorkingDayDto, type WorkShiftAssignmentDto, type WorkShiftBreakInput,
  type WorkShiftCalendarFilters, type WorkShiftTypeData,
} from "@almacen/shared";
import { ApiError, readBody, readBoolean, readId, readInteger, readText } from "../auth/request.utils.js";

export function validateCalendarInput<T>(callback: () => T): T {
  try { return callback(); }
  catch (error) { throw new ApiError(400, error instanceof Error ? error.message : "La planificación no es válida."); }
}

const readTime = (value: unknown) => {
  if (typeof value !== "string" || !isWorkShiftTime(value)) throw new ApiError(400, "El horario debe tener formato HH:mm.");
  return value;
};
const readDay = (value: unknown) => {
  if (typeof value !== "string" || !isWorkShiftDate(value)) throw new ApiError(400, "La fecha debe ser válida y tener formato AAAA-MM-DD.");
  return value;
};
export const readShiftNotes = (value: unknown) => value === null ? null : readText(value, "observación", 1000, true) || null;

export function assertWorkShiftTypeRevision(expected: string | undefined, actual: string) {
  if (expected !== undefined && expected !== actual) throw new ApiError(409, "El tipo de jornada cambió. Volvé a previsualizar antes de confirmar.");
}

export function readWorkShiftBreaks(value: unknown): WorkShiftBreakInput[] {
  if (!Array.isArray(value) || value.length > 8) throw new ApiError(400, "Enviá una lista de hasta ocho descansos.");
  return value.map((entry: unknown): WorkShiftBreakInput => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new ApiError(400, "El descanso no es válido.");
    if ((entry as Record<string, unknown>).mode === "FLEXIBLE") {
      const item = readBody(entry, ["mode", "durationMinutes"]);
      const durationMinutes = readInteger(item.durationMinutes, "duración del descanso", 1);
      if (durationMinutes > 1440) throw new ApiError(400, "El descanso no puede superar 1440 minutos.");
      return { mode: "FLEXIBLE", durationMinutes };
    }
    const item = readBody(entry, ["mode", "startTime", "endTime", "startsNextDay", "endsNextDay"]);
    if (item.mode !== "FIXED") throw new ApiError(400, "El descanso debe ser flexible o con horario fijo.");
    return { mode: "FIXED", startTime: readTime(item.startTime), endTime: readTime(item.endTime),
      startsNextDay: item.startsNextDay === undefined ? false : readBoolean(item.startsNextDay),
      endsNextDay: item.endsNextDay === undefined ? false : readBoolean(item.endsNextDay) };
  });
}

const typeFields = ["name", "icon", "iconColor", "color", "isWorkingDay", "startTime", "endTime", "endsNextDay", "breaks", "lateToleranceMinutes"];

export function readWorkShiftType(body: unknown, current?: WorkShiftTypeData & { isActive: boolean }) {
  const source = readBody(body, current ? [...typeFields, "isActive"] : typeFields);
  const name = source.name === undefined && current ? current.name : readText(source.name, "nombre de la jornada", 24);
  const icon = readText(source.icon === undefined ? current?.icon : source.icon, "icono", 60);
  const color = readText(source.color === undefined ? current?.color : source.color, "color", 7);
  const iconColor = source.iconColor === undefined ? current?.iconColor ?? "#FFFFFF" : readText(source.iconColor, "color del icono", 7).toUpperCase();
  if (iconColor !== "#000000" && iconColor !== "#FFFFFF") throw new ApiError(400, "El icono debe ser negro o blanco.");
  if (!/^[a-z][a-z0-9-]*$/.test(icon)) throw new ApiError(400, "El identificador del icono no es válido.");
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new ApiError(400, "El color debe tener formato hexadecimal, por ejemplo #2563EB.");
  const time = (key: "startTime" | "endTime") => source[key] === undefined ? current?.[key] ?? null : source[key] === null ? null : readTime(source[key]);
  const data: WorkShiftTypeData = {
    name, icon, iconColor, color: color.toUpperCase(),
    lateToleranceMinutes: source.lateToleranceMinutes === undefined ? current?.lateToleranceMinutes ?? 0 : readInteger(source.lateToleranceMinutes, "tolerancia de llegada tarde", 0),
    isWorkingDay: source.isWorkingDay === undefined ? current?.isWorkingDay ?? true : readBoolean(source.isWorkingDay),
    startTime: time("startTime"), endTime: time("endTime"),
    endsNextDay: source.endsNextDay === undefined ? current?.endsNextDay ?? false : readBoolean(source.endsNextDay),
    breaks: source.breaks === undefined ? current?.breaks ?? [] : readWorkShiftBreaks(source.breaks),
  };
  validateCalendarInput(() => validateWorkShiftType(data));
  return { data, isActive: source.isActive === undefined ? current?.isActive ?? true : readBoolean(source.isActive) };
}

export function readWorkShiftTypeList(query: Record<string, unknown>): boolean {
  if (!Object.keys(query).length) return false;
  const source = readBody(query, ["includeInactive"]);
  if (source.includeInactive !== "true" && source.includeInactive !== "false") throw new ApiError(400, "includeInactive debe ser true o false.");
  return source.includeInactive === "true";
}

export function readWorkShiftAssignment(body: unknown, requireRevision = false) {
  const source = readBody(body, ["employeeId", "workShiftTypeId", "expectedTypeUpdatedAt", "dates", "from", "to", "weekdays", "notes"]);
  const data: WorkShiftAssignmentDto = { employeeId: readId(source.employeeId), workShiftTypeId: readId(source.workShiftTypeId) };
  if (source.expectedTypeUpdatedAt !== undefined) {
    const revision = readText(source.expectedTypeUpdatedAt, "versión del tipo de jornada", 30);
    const date = new Date(revision);
    if (!Number.isFinite(date.getTime()) || date.toISOString() !== revision) throw new ApiError(400, "La versión del tipo de jornada no es válida.");
    data.expectedTypeUpdatedAt = revision;
  }
  if (requireRevision && data.expectedTypeUpdatedAt === undefined) throw new ApiError(400, "Previsualizá la asignación y enviá expectedTypeUpdatedAt para confirmarla.");
  if (source.dates !== undefined) {
    if (!Array.isArray(source.dates)) throw new ApiError(400, "Las fechas deben enviarse como una lista.");
    data.dates = source.dates.map(readDay);
  }
  if (source.from !== undefined) data.from = readDay(source.from);
  if (source.to !== undefined) data.to = readDay(source.to);
  if (source.weekdays !== undefined) {
    if (!Array.isArray(source.weekdays)) throw new ApiError(400, "Los días de la semana deben enviarse como una lista.");
    data.weekdays = source.weekdays.map((day: unknown) => readInteger(day, "día de la semana"));
  }
  if (source.notes !== undefined) data.notes = readShiftNotes(source.notes);
  return { data, dates: validateCalendarInput(() => getWorkShiftAssignmentDates(data)) };
}

export function readWorkShiftCalendarFilters(query: Record<string, unknown>): WorkShiftCalendarFilters {
  const source = readBody(query, ["from", "to", "employeeId"]);
  const filters: WorkShiftCalendarFilters = { from: readDay(source.from), to: readDay(source.to) };
  validateCalendarInput(() => getWorkShiftDays(filters.from, filters.to));
  if (source.employeeId !== undefined) filters.employeeId = readId(source.employeeId);
  return filters;
}

export function readNonWorkingDayUpdate(body: unknown): UpdateNonWorkingDayDto {
  const source = readBody(body, ["date", "workShiftTypeId", "notes", "isActive"]);
  return {
    ...(source.date !== undefined && { date: readDay(source.date) }),
    ...(source.workShiftTypeId !== undefined && { workShiftTypeId: readId(source.workShiftTypeId) }),
    ...(source.notes !== undefined && { notes: readShiftNotes(source.notes) }),
    ...(source.isActive !== undefined && { isActive: readBoolean(source.isActive) }),
  };
}

export function readWorkShiftAssignmentBatch(body: unknown, requireRevision = false) {
  const source = readBody(body, ["employeeId", "assignments"]);
  const employeeId = readId(source.employeeId);
  if (!Array.isArray(source.assignments) || !source.assignments.length || source.assignments.length > 32) {
    throw new ApiError(400, "Seleccioná entre una y 32 jornadas diferentes.");
  }
  const assignments = source.assignments.map((entry: unknown) => {
    const item = readBody(entry, ["workShiftTypeId", "dates", "expectedTypeUpdatedAt"]);
    return readWorkShiftAssignment({ ...item, employeeId }, requireRevision);
  });
  if (new Set(assignments.map((item) => item.data.workShiftTypeId)).size !== assignments.length) throw new ApiError(400, "Agrupá las fechas de cada jornada sin repetir el tipo.");
  const dates = assignments.flatMap((item) => item.dates).sort();
  if (dates.length > 184) throw new ApiError(400, "Guardá hasta 184 asignaciones por vez.");
  validateCalendarInput(() => getWorkShiftDays(dates[0]!, dates[dates.length - 1]!));
  return { employeeId, assignments };
}
