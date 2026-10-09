import {
  createWorkShiftAssignmentDrafts, getNonWorkingDayInterval, getUserDisplayName, type AuthSessionInfo, type EmployeeNonWorkingDayDto,
  type WorkShiftAssignmentDto, type WorkShiftAssignmentDraft, type WorkShiftAssignmentBatchPreview, type WorkShiftCalendarDto, type WorkShiftCalendarFilters,
} from "@almacen/shared";
import type { Prisma } from "../../../generated/prisma/index.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../auth/request.utils.js";
import { assertCalendarEntryNotEnded, canReadWorkShift, getCalendarEmployeeId } from "./work-shifts.access.js";
import { assertNoCalendarConflicts, employeeName, getCalendarConflicts, getShiftEmployee, lockShiftEmployee, workShiftTransactionOptions } from "./work-shifts.database.js";
import { getWorkShiftsFromDatabase } from "./work-shifts.service.js";
import { getWorkShiftTypeRecord, lockWorkShiftType, workShiftTypeResponse } from "./work-shift-types.service.js";
import { assertWorkShiftTypeRevision, readNonWorkingDayUpdate, readWorkShiftAssignmentBatch, validateCalendarInput } from "./work-shift-types.validation.js";

const dayInclude = {
  employee: { select: { id: true, firstname: true, lastname: true, fullname: true, isActive: true } },
  createdBy: { select: { id: true, username: true, firstname: true, lastname: true } },
  workShiftType: { select: { name: true, icon: true, iconColor: true, color: true } },
} satisfies Prisma.WorkShiftInclude;
type DayRecord = Prisma.WorkShiftGetPayload<{ include: typeof dayInclude }>;

const dayResponse = ({ workShiftType, ...record }: DayRecord): EmployeeNonWorkingDayDto => ({
  ...record, ...workShiftType, date: record.date.toISOString().slice(0, 10), isActive: record.status !== "CANCELLED",
  createdBy: { id: record.createdBy.id, username: record.createdBy.username, name: getUserDisplayName(record.createdBy) },
  allDay: true, startsAt: null, endsAt: null,
  createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString(),
  employee: { id: record.employee.id, name: employeeName(record.employee), isActive: record.employee.isActive },
});

export async function getWorkShiftCalendar(filters: WorkShiftCalendarFilters, session: AuthSessionInfo, ownOnly = false): Promise<WorkShiftCalendarDto> {
  const employeeId = getCalendarEmployeeId(filters, session, ownOnly);
  const empty = { timeZone: session.commerce.timeZone, employeeId: employeeId ?? null, shifts: [], nonWorkingDays: [] };
  if (ownOnly && !session.employee) return empty;
  const [shifts, records] = await Promise.all([getWorkShiftsFromDatabase(filters, session, ownOnly), prisma.workShift.findMany({
    where: { commerceId: session.commerce.id, ...(employeeId !== undefined && { employeeId }), workShiftType: { isWorkingDay: false }, date: { gte: new Date(`${filters.from}T00:00:00.000Z`), lte: new Date(`${filters.to}T00:00:00.000Z`) } }, include: dayInclude, orderBy: [{ date: "asc" }, { employeeId: "asc" }, { id: "asc" }], take: 2001,
  })]);
  if (records.length > 2000) throw new ApiError(400, "Hay demasiados días no laborables. Acortá las fechas o filtrá por empleado.");
  return { timeZone: session.commerce.timeZone, employeeId: employeeId ?? null, shifts, nonWorkingDays: records.map(dayResponse) };
}

async function prepareAssignment(database: Prisma.TransactionClient, data: WorkShiftAssignmentDto, dates: string[], session: AuthSessionInfo) {
  const type = workShiftTypeResponse(await getWorkShiftTypeRecord(database, data.workShiftTypeId, session.commerce.id));
  assertWorkShiftTypeRevision(data.expectedTypeUpdatedAt, type.updatedAt);
  const drafts = validateCalendarInput(() => createWorkShiftAssignmentDrafts(type, dates, session.commerce.timeZone));
  return { type, drafts };
}

async function saveAssignmentDrafts(tx: Prisma.TransactionClient, drafts: WorkShiftAssignmentDraft[], employeeId: number, session: AuthSessionInfo, notes?: string | null) {
    const common = { commerceId: session.commerce.id, employeeId, createdById: session.user.id, notes: notes ?? null };
    if (drafts.length) await tx.workShift.createMany({ data: drafts.map((draft) => ({ ...common,
      workShiftTypeId: draft.workShiftTypeId, date: new Date(`${draft.date}T00:00:00.000Z`),
      startsAt: draft.kind === "WORK_SHIFT" ? new Date(draft.startsAt!) : null,
      endsAt: draft.kind === "WORK_SHIFT" ? new Date(draft.endsAt!) : null,
    })) });
    const working = drafts.filter((draft) => draft.kind === "WORK_SHIFT");
    const nonWorking = drafts.filter((draft) => draft.kind === "NON_WORKING_DAY");
    return { createdCount: drafts.length, workShiftsCount: working.length, nonWorkingDaysCount: nonWorking.length };
}

async function prepareAssignmentBatch(tx: Prisma.TransactionClient, input: ReturnType<typeof readWorkShiftAssignmentBatch>, session: AuthSessionInfo) {
  const drafts: WorkShiftAssignmentDraft[] = [];
  const workShiftTypes: { id: number; updatedAt: string }[] = [];
  for (const item of input.assignments) {
    const prepared = await prepareAssignment(tx, item.data, item.dates, session);
    drafts.push(...prepared.drafts);
    workShiftTypes.push({ id: prepared.type.id, updatedAt: prepared.type.updatedAt });
  }
  return { drafts, workShiftTypes };
}

export async function previewWorkShiftAssignments(body: unknown, session: AuthSessionInfo): Promise<WorkShiftAssignmentBatchPreview> {
  const input = readWorkShiftAssignmentBatch(body);
  return prisma.$transaction(async (tx) => {
    const employee = await getShiftEmployee(tx, input.employeeId, session.commerce.id);
    const prepared = await prepareAssignmentBatch(tx, input, session);
    const conflicts = await getCalendarConflicts(tx, prepared.drafts, input.employeeId, session.commerce.id, session.commerce.timeZone);
    return { employee: { id: employee.id, name: employeeName(employee) }, timeZone: session.commerce.timeZone,
      ...prepared, conflicts, canSave: conflicts.length === 0 };
  }, { ...workShiftTransactionOptions, isolationLevel: "RepeatableRead" });
}

export async function assignWorkShiftTypes(body: unknown, session: AuthSessionInfo) {
  const input = readWorkShiftAssignmentBatch(body, true);
  return prisma.$transaction(async (tx) => {
    await lockShiftEmployee(tx, input.employeeId, session.commerce.id);
    await getShiftEmployee(tx, input.employeeId, session.commerce.id);
    // Orden estable para no bloquear dos tipos en orden inverso en solicitudes simultáneas.
    for (const id of input.assignments.map((item) => item.data.workShiftTypeId).sort((a, b) => a - b)) {
      await lockWorkShiftType(tx, id, session.commerce.id);
    }
    const { drafts } = await prepareAssignmentBatch(tx, input, session);
    assertNoCalendarConflicts(await getCalendarConflicts(tx, drafts, input.employeeId, session.commerce.id, session.commerce.timeZone));
    return saveAssignmentDrafts(tx, drafts, input.employeeId, session);
  }, workShiftTransactionOptions);
}

async function getDayRecord(database: Prisma.TransactionClient, id: number, commerceId: number) {
  const record = await database.workShift.findFirst({ where: { id, commerceId, workShiftType: { isWorkingDay: false } }, include: dayInclude });
  if (!record) throw new ApiError(404, "Día no laboral no encontrado en este comercio.");
  return record;
}

async function getLockedDay(tx: Prisma.TransactionClient, id: number, commerceId: number) {
  const record = await getDayRecord(tx, id, commerceId);
  await lockShiftEmployee(tx, record.employeeId, commerceId);
  return getDayRecord(tx, id, commerceId);
}

export async function getNonWorkingDay(id: number, session: AuthSessionInfo) {
  const record = await getDayRecord(prisma, id, session.commerce.id);
  if (!canReadWorkShift(session, record.employeeId)) throw new ApiError(404, "Día no laboral no encontrado en este comercio.");
  return dayResponse(record);
}

export async function updateNonWorkingDay(id: number, body: unknown, session: AuthSessionInfo) {
  const data = readNonWorkingDayUpdate(body);
  return prisma.$transaction(async (tx) => {
    const record = await getLockedDay(tx, id, session.commerce.id);
    assertCalendarEntryNotEnded(getNonWorkingDayInterval({ date: record.date.toISOString().slice(0, 10) }, session.commerce.timeZone).endsAt);
    const isActive = data.isActive ?? record.status !== "CANCELLED";
    await getShiftEmployee(tx, record.employeeId, session.commerce.id, isActive);
    const date = data.date ?? record.date.toISOString().slice(0, 10);
    const typeId = data.workShiftTypeId ?? record.workShiftTypeId;
    await lockWorkShiftType(tx, typeId, session.commerce.id);
    const type = workShiftTypeResponse(await getWorkShiftTypeRecord(tx, typeId, session.commerce.id, data.workShiftTypeId !== undefined));
    if (type.isWorkingDay) throw new ApiError(400, "Elegí un tipo de jornada no laboral. Para trabajar, creá un turno por separado.");
    const draft = validateCalendarInput(() => createWorkShiftAssignmentDrafts(type, [date], session.commerce.timeZone)[0]!);
    if (isActive) {
      assertNoCalendarConflicts(await getCalendarConflicts(tx, [draft], record.employeeId, session.commerce.id, session.commerce.timeZone, undefined, id));
    }
    const updated = await tx.workShift.update({ where: { id, commerceId: session.commerce.id }, include: dayInclude, data: {
      date: new Date(`${date}T00:00:00.000Z`), status: isActive ? "SCHEDULED" : "CANCELLED",
      ...(data.workShiftTypeId !== undefined && { workShiftTypeId: data.workShiftTypeId }),
      ...(data.notes !== undefined && { notes: data.notes }),
    } });
    return dayResponse(updated);
  }, workShiftTransactionOptions);
}

export async function cancelNonWorkingDay(id: number, reason: string, session: AuthSessionInfo) {
  return prisma.$transaction(async (tx) => {
    const record = await getLockedDay(tx, id, session.commerce.id);
    if (record.status === "CANCELLED") throw new ApiError(409, "Este día no laboral ya está cancelado.");
    assertCalendarEntryNotEnded(getNonWorkingDayInterval({ date: record.date.toISOString().slice(0, 10) }, session.commerce.timeZone).endsAt);
    const updated = await tx.workShift.update({ where: { id, commerceId: session.commerce.id }, include: dayInclude,
      data: { status: "CANCELLED", notes: [record.notes, `Cancelación: ${reason}`].filter(Boolean).join("\n") } });
    return dayResponse(updated);
  }, workShiftTransactionOptions);
}
