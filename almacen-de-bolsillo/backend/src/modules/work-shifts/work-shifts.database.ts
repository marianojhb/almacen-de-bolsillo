import { findCalendarDraftConflicts, findNonWorkingDayConflicts, findWorkShiftConflicts, getNonWorkingDayInterval, type WorkShiftAssignmentDraft, type WorkShiftConflict, type WorkShiftDraft } from "@almacen/shared";
import type { Prisma } from "../../../generated/prisma/index.js";
import { ApiError } from "../auth/request.utils.js";

type EmployeeName = { id: number; firstname: string | null; lastname: string | null; fullname: string | null };
export const employeeName = (employee: EmployeeName) => employee.fullname || [employee.firstname, employee.lastname].filter(Boolean).join(" ") || `Empleado #${employee.id}`;

export const workShiftTransactionOptions = { isolationLevel: "ReadCommitted", maxWait: 5000, timeout: 15000 } as const;

export async function getShiftEmployee(database: Prisma.TransactionClient, employeeId: number, commerceId: number, mustBeActive = true) {
  const employee = await database.employee.findUnique({ where: { id: employeeId, commerceId },
    select: { id: true, firstname: true, lastname: true, fullname: true, isActive: true } });
  if (!employee) throw new ApiError(404, "Empleado no encontrado en este comercio.");
  if (mustBeActive && !employee.isActive) throw new ApiError(409, "No se pueden asignar ni iniciar turnos de un empleado desactivado.");
  return employee;
}

// Las asignaciones y los fichajes usan el mismo bloqueo por empleado.
export async function lockShiftEmployee(tx: Prisma.TransactionClient, employeeId: number, commerceId: number) {
  const rows = await tx.$queryRaw<{ id: number }[]>`
    SELECT "id_employee_e" AS id FROM "employees_e"
    WHERE "id_employee_e" = ${employeeId} AND "id_commerce_e" = ${commerceId}
    FOR UPDATE
  `;
  if (!rows.length) throw new ApiError(404, "Empleado no encontrado en este comercio.");
}

export async function getCalendarConflicts(database: Prisma.TransactionClient, drafts: (WorkShiftDraft | WorkShiftAssignmentDraft)[], employeeId: number,
  commerceId: number, timeZone: string, excludedShiftId?: number, excludedDayId?: number): Promise<WorkShiftConflict[]> {
  if (!drafts.length) return [];
  const intervals = drafts.map((draft) => "kind" in draft && draft.kind === "NON_WORKING_DAY"
    ? getNonWorkingDayInterval(draft, timeZone)
    : { startsAt: new Date(draft.startsAt!), endsAt: new Date(draft.endsAt!) });
  const from = new Date(Math.min(...intervals.map((interval) => interval.startsAt.getTime())));
  const to = new Date(Math.max(...intervals.map((interval) => interval.endsAt.getTime())));
  const existing = await database.workShift.findMany({
    where: { commerceId, employeeId, status: { not: "CANCELLED" }, startsAt: { lt: to }, endsAt: { gt: from },
      ...(excludedShiftId !== undefined && { id: { not: excludedShiftId } }) },
    select: { id: true, startsAt: true, endsAt: true },
  });
  const days = await database.workShift.findMany({
    where: { commerceId, employeeId, ...(excludedDayId !== undefined && { id: { not: excludedDayId } }),
      status: { not: "CANCELLED" }, workShiftType: { isWorkingDay: false },
      date: { gte: new Date(from.getTime() - 86400000), lte: new Date(to.getTime() + 86400000) } },
    select: { id: true, date: true, status: true },
  });
  const timedDrafts = drafts.map((draft, index) => ({ date: draft.date, startsAt: intervals[index]!.startsAt.toISOString(), endsAt: intervals[index]!.endsAt.toISOString() }));
  const savedConflicts = findWorkShiftConflicts(timedDrafts, existing.filter((row): row is { id: number; startsAt: Date; endsAt: Date } => row.startsAt !== null && row.endsAt !== null)).filter((conflict) => conflict.existingShiftId !== null);
  return [...findCalendarDraftConflicts(drafts, timeZone), ...savedConflicts, ...findNonWorkingDayConflicts(drafts,
    days.map((day) => ({ ...day, isActive: day.status !== "CANCELLED", date: day.date.toISOString().slice(0, 10) })), timeZone)];
}

export function assertNoCalendarConflicts(conflicts: WorkShiftConflict[]) {
  if (conflicts.length) throw new ApiError(409, "La planificación tiene conflictos con turnos o días no laborables. Volvé a previsualizar; no se guardó ningún cambio.");
}
