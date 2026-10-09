import {
  addCalendarDays, createWorkShiftDraft, getCommerceDayStart, getWorkShiftDays,
  isWorkShiftTime,
  type UpdateWorkShiftDto, type WorkShiftFilters, type WorkShiftStatus,
} from "@almacen/shared";
import { ApiError, readBody, readId, readInteger, readText } from "../auth/request.utils.js";

const statuses: WorkShiftStatus[] = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const validateCalendar = <T>(callback: () => T): T => {
  try { return callback(); }
  catch (error) { throw new ApiError(400, error instanceof Error ? error.message : "El horario no es válido."); }
};

const readNotes = (value: unknown) => value === null ? null : readText(value, "observación", 1000, true) || null;
const readTime = (value: unknown): string => {
  if (typeof value !== "string" || !isWorkShiftTime(value)) throw new ApiError(400, "El horario debe tener formato HH:mm, entre 00:00 y 23:59.");
  return value;
};

export function readShiftFilters(query: Record<string, unknown>): WorkShiftFilters {
  const source = readBody(query, ["from", "to", "employeeId", "weekday", "startTime", "endTime", "status"]);
  const from = readText(source.from, "fecha inicial", 10);
  const to = readText(source.to, "fecha final", 10);
  validateCalendar(() => getWorkShiftDays(from, to));
  const filters: WorkShiftFilters = { from, to };
  if (source.employeeId !== undefined) filters.employeeId = readId(source.employeeId);
  if (source.weekday !== undefined) {
    const weekday = typeof source.weekday === "string" && /^[0-6]$/.test(source.weekday) ? Number(source.weekday) : source.weekday;
    filters.weekday = readInteger(weekday, "día de la semana");
    if (filters.weekday > 6) throw new ApiError(400, "El día de la semana no es válido.");
  }
  if (source.status !== undefined) {
    if (typeof source.status !== "string" || !statuses.includes(source.status as WorkShiftStatus)) throw new ApiError(400, "El estado del turno no es válido.");
    filters.status = source.status as WorkShiftStatus;
  }
  if (source.startTime !== undefined || source.endTime !== undefined) {
    filters.startTime = readTime(source.startTime);
    filters.endTime = readTime(source.endTime);
    if (filters.startTime >= filters.endTime) throw new ApiError(400, "La franja de consulta debe terminar después de su inicio, dentro del mismo día.");
  }
  return filters;
}

export function readShiftUpdate(body: unknown): UpdateWorkShiftDto {
  const source = readBody(body, ["notes"]);
  return { ...(source.notes !== undefined && { notes: readNotes(source.notes) }) };
}

export function getShiftFilterIntervals(filters: WorkShiftFilters, timeZone: string) {
  return validateCalendar(() => getWorkShiftDays(filters.from, filters.to)
    .filter((day) => filters.weekday === undefined || new Date(`${day}T12:00:00.000Z`).getUTCDay() === filters.weekday)
    .map((day) => {
      if (filters.startTime !== undefined && filters.endTime !== undefined) {
        const draft = createWorkShiftDraft(day, { startTime: filters.startTime, endTime: filters.endTime }, timeZone);
        return { startsAt: new Date(draft.startsAt), endsAt: new Date(draft.endsAt) };
      }
      return { startsAt: getCommerceDayStart(day, timeZone), endsAt: getCommerceDayStart(addCalendarDays(day, 1), timeZone) };
    }));
}

export function readCancelReason(body: unknown): string {
  return readText(readBody(body, ["reason"]).reason, "motivo de cancelación", 1000);
}

export function assertEmptyShiftActionBody(body: unknown): void {
  if (body === undefined || body === null) return;
  if (typeof body !== "object" || Array.isArray(body) || Object.keys(body).length) {
    throw new ApiError(400, "La entrada y salida usan la hora del servidor; no envíes horarios ni otros campos.");
  }
}
