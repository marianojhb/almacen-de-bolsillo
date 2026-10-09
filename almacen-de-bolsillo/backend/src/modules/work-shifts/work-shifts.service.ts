import { addCalendarDays, getWorkShiftLocalFields, getUserDisplayName, workShiftLocalToDate, type AuthSessionInfo, type WorkShiftDto, type WorkShiftFilters } from "@almacen/shared";
import type { Prisma } from "../../../generated/prisma/index.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../auth/request.utils.js";
import { assertCalendarEntryNotEnded, assertScheduledWorkShift, assertStartedWorkShift, canReadWorkShift, canRecordWorkShift } from "./work-shifts.access.js";
import { getShiftFilterIntervals, readShiftUpdate } from "./work-shifts.validation.js";
import { employeeName, getShiftEmployee as getEmployee, lockShiftEmployee as lockEmployee } from "./work-shifts.database.js";

const shiftInclude = {
  employee: { select: { id: true, firstname: true, lastname: true, fullname: true, isActive: true } },
  createdBy: { select: { id: true, username: true, firstname: true, lastname: true } },
  workShiftType: { include: { breaks: { orderBy: { id: "asc" } } } },
} satisfies Prisma.WorkShiftInclude;
type ShiftRecord = Prisma.WorkShiftGetPayload<{ include: typeof shiftInclude }>;

const shiftResponse = ({ workShiftType, ...shift }: ShiftRecord, timeZone: string): WorkShiftDto => ({
  // La asignación conserva su ID y sus fechas; del tipo solo tomamos su presentación y tolerancia.
  id: shift.id, commerceId: shift.commerceId, employeeId: shift.employeeId, workShiftTypeId: shift.workShiftTypeId,
  status: shift.status, notes: shift.notes, createdById: shift.createdById,
  name: workShiftType.name, icon: workShiftType.icon, iconColor: workShiftType.iconColor, color: workShiftType.color,
  lateToleranceMinutes: workShiftType.lateToleranceMinutes,
  createdBy: { id: shift.createdBy.id, username: shift.createdBy.username, name: getUserDisplayName(shift.createdBy) },
  startsAt: shift.startsAt?.toISOString() ?? "", endsAt: shift.endsAt?.toISOString() ?? "",
  actualStartedAt: shift.actualStartedAt?.toISOString() ?? null, actualEndedAt: shift.actualEndedAt?.toISOString() ?? null,
  createdAt: shift.createdAt.toISOString(), updatedAt: shift.updatedAt.toISOString(),
  employee: { id: shift.employee.id, name: employeeName(shift.employee), isActive: shift.employee.isActive },
  breaks: workShiftType.breaks.map((item) => {
    const day = shift.date.toISOString().slice(0, 10);
    // Los horarios del descanso son locales al comercio, no horas UTC.
    return { id: item.id, mode: item.mode, durationMinutes: item.mode === "FLEXIBLE" ? item.durationMinutes : null,
      startsAt: item.mode === "FIXED" && item.startTime
        ? workShiftLocalToDate(item.startsNextDay ? addCalendarDays(day, 1) : day, item.startTime, timeZone).toISOString() : null,
      endsAt: item.mode === "FIXED" && item.endTime
        ? workShiftLocalToDate(item.endsNextDay ? addCalendarDays(day, 1) : day, item.endTime, timeZone).toISOString() : null,
    };
  }),
});

export async function getWorkShiftsFromDatabase(filters: WorkShiftFilters, session: AuthSessionInfo, ownOnly = false) {
  if (ownOnly && !session.employee) return [];
  const employeeId = ownOnly ? session.employee!.id : filters.employeeId;
  if (employeeId !== undefined) await getEmployee(prisma, employeeId, session.commerce.id, false);
  const intervals = getShiftFilterIntervals(filters, session.commerce.timeZone);
  if (!intervals.length) return [];
  const records = await prisma.workShift.findMany({
    where: { commerceId: session.commerce.id,
      ...(employeeId !== undefined && { employeeId }), ...(filters.status !== undefined && { status: filters.status }),
      workShiftType: { isWorkingDay: true }, startsAt: { not: null }, endsAt: { not: null },
      OR: intervals.map((interval) => ({ startsAt: { lt: interval.endsAt }, endsAt: { gt: interval.startsAt } })),
    },
    include: shiftInclude, orderBy: [{ startsAt: "asc" }, { employeeId: "asc" }, { id: "asc" }], take: 2001,
  });
  if (records.length > 2000) throw new ApiError(400, "Hay demasiados turnos para esta consulta. Acortá las fechas o filtrá por empleado.");
  return records.map((record) => shiftResponse(record, session.commerce.timeZone));
}

export async function getWorkShiftByIdFromDatabase(id: number, session: AuthSessionInfo) {
  const record = await prisma.workShift.findUnique({ where: { id, commerceId: session.commerce.id }, include: shiftInclude });
  if (!record || !canReadWorkShift(session, record.employeeId)) throw new ApiError(404, "Turno no encontrado en este comercio.");
  return shiftResponse(record, session.commerce.timeZone);
}

export async function getWorkShiftEmployeesFromDatabase(commerceId: number) {
  const employees = await prisma.employee.findMany({
    where: { commerceId, isActive: true }, select: { id: true, firstname: true, lastname: true, fullname: true },
    orderBy: [{ lastname: "asc" }, { firstname: "asc" }],
  });
  // El calendario no necesita consultar salarios, DNI ni otros datos de la ficha.
  return employees.map((employee) => ({ id: employee.id, name: employeeName(employee) }));
}

const getLockedShift = async (tx: Prisma.TransactionClient, id: number, commerceId: number) => {
  const initial = await tx.workShift.findUnique({ where: { id, commerceId }, select: { employeeId: true } });
  if (!initial) throw new ApiError(404, "Turno no encontrado en este comercio.");
  await lockEmployee(tx, initial.employeeId, commerceId);
  return tx.workShift.findUniqueOrThrow({ where: { id, commerceId }, include: shiftInclude });
};

export async function updateWorkShift(id: number, body: unknown, session: AuthSessionInfo) {
  const data = readShiftUpdate(body);
  return prisma.$transaction(async (tx) => {
    const record = await getLockedShift(tx, id, session.commerce.id);
    assertScheduledWorkShift(record.status);
    if (!record.endsAt) throw new ApiError(400, "Los días no laborales no se editan como turnos.");
    assertCalendarEntryNotEnded(record.endsAt);
    await getEmployee(tx, record.employeeId, session.commerce.id);
    const updated = await tx.workShift.update({ where: { id, commerceId: session.commerce.id }, include: shiftInclude, data: {
      ...(data.notes !== undefined && { notes: data.notes }),
    } });
    return shiftResponse(updated, session.commerce.timeZone);
  }, { isolationLevel: "ReadCommitted" });
}

export async function cancelWorkShift(id: number, reason: string, session: AuthSessionInfo) {
  return prisma.$transaction(async (tx) => {
    const record = await getLockedShift(tx, id, session.commerce.id);
    assertScheduledWorkShift(record.status);
    if (!record.endsAt) throw new ApiError(400, "Los días no laborales se gestionan desde su propia opción.");
    assertCalendarEntryNotEnded(record.endsAt);
    const updated = await tx.workShift.update({ where: { id, commerceId: session.commerce.id }, include: shiftInclude,
      data: { status: "CANCELLED", notes: [record.notes, `Cancelación: ${reason}`].filter(Boolean).join("\n") },
    });
    return shiftResponse(updated, session.commerce.timeZone);
  }, { isolationLevel: "ReadCommitted" });
}

export async function recordWorkShiftAttendance(id: number, action: "start" | "finish", session: AuthSessionInfo) {
  return prisma.$transaction(async (tx) => {
    const record = await getLockedShift(tx, id, session.commerce.id);
    if (!canRecordWorkShift(session, record.employeeId)) throw new ApiError(404, "Turno no encontrado en este comercio.");
    const now = new Date();
    if (action === "start") {
      assertScheduledWorkShift(record.status);
      if (!record.startsAt || !record.endsAt) throw new ApiError(400, "Un día no laboral no admite fichaje.");
      assertCalendarEntryNotEnded(record.endsAt, now);
      await getEmployee(tx, record.employeeId, session.commerce.id);
      const today = getWorkShiftLocalFields(now, session.commerce.timeZone).date;
      const scheduledDay = getWorkShiftLocalFields(record.startsAt, session.commerce.timeZone).date;
      if (today !== scheduledDay && !(now >= record.startsAt && now < record.endsAt)) throw new ApiError(409, "Solo podés iniciar un turno del día actual o que abarque este momento.");
      if (await tx.workShift.findFirst({ where: { commerceId: session.commerce.id, employeeId: record.employeeId, status: "IN_PROGRESS" }, select: { id: true } })) {
        throw new ApiError(409, "El empleado ya tiene un turno en curso. Primero registrá su salida.");
      }
    } else {
      assertStartedWorkShift(record.status);
      if (!record.actualStartedAt || now < record.actualStartedAt) throw new ApiError(409, "La entrada real del turno no es válida.");
    }
    const updated = await tx.workShift.update({ where: { id, commerceId: session.commerce.id }, include: shiftInclude,
      data: action === "start" ? { status: "IN_PROGRESS", actualStartedAt: now } : { status: "COMPLETED", actualEndedAt: now },
    });
    return shiftResponse(updated, session.commerce.timeZone);
  }, { isolationLevel: "ReadCommitted" });
}
