import { isWorkShiftInPast, type AuthSessionInfo, type WorkShiftCalendarFilters, type WorkShiftStatus } from "@almacen/shared";
import { ApiError } from "../auth/request.utils.js";

export function canReadWorkShift(session: AuthSessionInfo, employeeId: number): boolean {
  return session.permissions.includes("work_shifts.read") || session.employee?.id === employeeId;
}

export function canRecordWorkShift(session: AuthSessionInfo, employeeId: number): boolean {
  return session.permissions.includes("work_shifts.manage") || session.employee?.id === employeeId;
}

export function getCalendarEmployeeId(filters: WorkShiftCalendarFilters, session: AuthSessionInfo, ownOnly: boolean): number | undefined {
  if (ownOnly) {
    if (filters.employeeId !== undefined) throw new ApiError(400, "En Mi calendario no se puede seleccionar otro empleado.");
    return session.employee?.id;
  }
  if (!session.permissions.includes("work_shifts.read")) throw new ApiError(403, "No tenés permiso para consultar los calendarios de otros empleados.");
  return filters.employeeId;
}

export function assertScheduledWorkShift(status: WorkShiftStatus): void {
  if (status !== "SCHEDULED") throw new ApiError(409, "Solo se puede editar, cancelar o iniciar un turno programado.");
}

export function assertStartedWorkShift(status: WorkShiftStatus): void {
  if (status !== "IN_PROGRESS") throw new ApiError(409, "Solo se puede finalizar un turno que está en curso.");
}

export function assertCalendarEntryNotEnded(endsAt: string | Date, now = new Date()): void {
  if (isWorkShiftInPast(endsAt, now)) throw new ApiError(409, "La jornada ya terminó. Solo se puede consultar su historial y completar una salida pendiente.");
}

export function assertWorkShiftTypeUnused(workingAssignments: number, nonWorkingAssignments: number): void {
  if (workingAssignments || nonWorkingAssignments) throw new ApiError(409, "La jornada tiene asignaciones o historial. No se puede eliminar ni cambiar entre laboral y no laboral; podés darla de baja.");
}
