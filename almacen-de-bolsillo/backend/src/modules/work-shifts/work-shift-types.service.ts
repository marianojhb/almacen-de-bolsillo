import type { WorkShiftBreakInput, WorkShiftTypeDto } from "@almacen/shared";
import type { Prisma } from "../../../generated/prisma/index.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../auth/request.utils.js";
import { workShiftTransactionOptions } from "./work-shifts.database.js";
import { assertWorkShiftTypeUnused } from "./work-shifts.access.js";
import { readWorkShiftType } from "./work-shift-types.validation.js";

const typeInclude = { breaks: { orderBy: { id: "asc" as const } } } satisfies Prisma.WorkShiftTypeInclude;
type TypeRecord = Prisma.WorkShiftTypeGetPayload<{ include: typeof typeInclude }>;

export function workShiftTypeResponse(record: TypeRecord): WorkShiftTypeDto {
  const breaks = record.breaks.map((item): WorkShiftBreakInput => {
    if (item.mode === "FLEXIBLE" && item.durationMinutes !== null) return { mode: item.mode, durationMinutes: item.durationMinutes };
    if (item.mode === "FIXED" && item.startTime !== null && item.endTime !== null) {
      return { mode: item.mode, startTime: item.startTime, endTime: item.endTime, startsNextDay: item.startsNextDay, endsNextDay: item.endsNextDay };
    }
    throw new ApiError(500, "El tipo de jornada tiene un descanso incompleto.");
  });
  return { ...record, breaks, createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString() };
}

export async function lockWorkShiftType(tx: Prisma.TransactionClient, id: number, commerceId: number) {
  const rows = await tx.$queryRaw<{ id: number }[]>`
    SELECT "id_work_shift_type_wst" AS id FROM "work_shift_types_wst"
    WHERE "id_work_shift_type_wst" = ${id} AND "id_commerce_wst" = ${commerceId}
    FOR UPDATE
  `;
  if (!rows.length) throw new ApiError(404, "Tipo de jornada no encontrado en este comercio.");
}

export async function getWorkShiftTypeRecord(database: Prisma.TransactionClient, id: number, commerceId: number, mustBeActive = true) {
  const record = await database.workShiftType.findUnique({ where: { id, commerceId }, include: typeInclude });
  if (!record) throw new ApiError(404, "Tipo de jornada no encontrado en este comercio.");
  if (mustBeActive && !record.isActive) throw new ApiError(409, "Este tipo de jornada está desactivado. No se pueden hacer nuevas asignaciones.");
  return record;
}

export async function listWorkShiftTypes(commerceId: number, includeInactive: boolean) {
  const records = await prisma.workShiftType.findMany({ where: { commerceId, ...(!includeInactive && { isActive: true }) },
    include: typeInclude, orderBy: [{ isActive: "desc" }, { name: "asc" }, { id: "asc" }], take: 2001 });
  if (records.length > 2000) throw new ApiError(400, "Hay demasiados tipos de jornada para esta consulta.");
  return records.map(workShiftTypeResponse);
}

export async function getWorkShiftType(id: number, commerceId: number) {
  return workShiftTypeResponse(await getWorkShiftTypeRecord(prisma, id, commerceId, false));
}

const breakRows = (breaks: WorkShiftBreakInput[], workShiftTypeId: number, commerceId: number) => breaks.map((item) => ({
  workShiftTypeId, commerceId, mode: item.mode,
  durationMinutes: item.mode === "FLEXIBLE" ? item.durationMinutes : null,
  startTime: item.mode === "FIXED" ? item.startTime : null, endTime: item.mode === "FIXED" ? item.endTime : null,
  startsNextDay: item.mode === "FIXED" ? item.startsNextDay ?? false : false,
  endsNextDay: item.mode === "FIXED" ? item.endsNextDay ?? false : false,
}));

export async function createWorkShiftType(body: unknown, commerceId: number) {
  const { data } = readWorkShiftType(body);
  const { breaks, ...fields } = data;
  return prisma.$transaction(async (tx) => {
    const record = await tx.workShiftType.create({ data: { ...fields, commerceId } });
    if (breaks.length) await tx.workShiftTypeBreak.createMany({ data: breakRows(breaks, record.id, commerceId) });
    return workShiftTypeResponse(await getWorkShiftTypeRecord(tx, record.id, commerceId));
  }, workShiftTransactionOptions);
}

export async function updateWorkShiftType(id: number, body: unknown, commerceId: number) {
  return prisma.$transaction(async (tx) => {
    await lockWorkShiftType(tx, id, commerceId);
    const current = workShiftTypeResponse(await getWorkShiftTypeRecord(tx, id, commerceId, false));
    const { data, isActive } = readWorkShiftType(body, current);
    const { breaks, ...fields } = data;
    if (data.isWorkingDay !== current.isWorkingDay) {
      await assertTypeHasNoAssignments(tx, id, commerceId);
    }
    await tx.workShiftType.update({ where: { id, commerceId }, data: { ...fields, isActive } });
    if (Object.prototype.hasOwnProperty.call(body, "breaks")) {
      await tx.workShiftTypeBreak.deleteMany({ where: { workShiftTypeId: id, commerceId } });
      if (breaks.length) await tx.workShiftTypeBreak.createMany({ data: breakRows(breaks, id, commerceId) });
    }
    // Nombre, apariencia y tolerancia se consultan del tipo, incluso en el historial.
    // Los horarios y descansos ya planificados no se reprograman.
    return workShiftTypeResponse(await getWorkShiftTypeRecord(tx, id, commerceId, false));
  }, workShiftTransactionOptions);
}

async function assertTypeHasNoAssignments(tx: Prisma.TransactionClient, id: number, commerceId: number) {
  const shifts = await tx.workShift.count({ where: { workShiftTypeId: id, commerceId } });
  assertWorkShiftTypeUnused(shifts, 0);
}

export async function deleteWorkShiftType(id: number, commerceId: number) {
  await prisma.$transaction(async (tx) => {
    await lockWorkShiftType(tx, id, commerceId);
    await assertTypeHasNoAssignments(tx, id, commerceId);
    await tx.workShiftTypeBreak.deleteMany({ where: { workShiftTypeId: id, commerceId } });
    await tx.workShiftType.delete({ where: { id, commerceId } });
  }, workShiftTransactionOptions);
}
