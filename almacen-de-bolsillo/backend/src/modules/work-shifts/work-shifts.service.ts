import type {
  CreateWorkShiftDto,
  WorkShift,
} from "@almacen/shared";
import { formatFullName } from "@almacen/shared";

import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../config/prisma.js";
import { WorkShiftError } from "./work-shift-types.service.js";

const workShiftInclude = {
  employee: {
    select: {
      id: true,
      fullname: true,
      firstname: true,
      lastname: true,
      userId: true,
      isActive: true,
    },
  },
  workShiftType: true,
} as const;

type WorkShiftRecord = Prisma.WorkShiftGetPayload<{
  include: typeof workShiftInclude;
}>;

function serializeWorkShift(
  record: WorkShiftRecord,
): WorkShift {
  return {
    ...record,
    employee: {
      ...record.employee,
      fullname: formatFullName(record.employee.firstname, record.employee.lastname) || null,
    },
    date: record.date.toISOString().slice(0, 10),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    workShiftType: {
      ...record.workShiftType,
      createdAt: record.workShiftType.createdAt.toISOString(),
      updatedAt: record.workShiftType.updatedAt.toISOString(),
    },
  };
}

export function readPositiveId(
  value: unknown,
  label: string,
): number {
  if (
    typeof value !== "number" &&
    typeof value !== "string"
  ) {
    throw new WorkShiftError(
      400,
      `El ID de ${label} no es válido.`,
    );
  }

  if (
    typeof value === "string" &&
    !/^[1-9]\d*$/.test(value)
  ) {
    throw new WorkShiftError(
      400,
      `El ID de ${label} no es válido.`,
    );
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new WorkShiftError(
      400,
      `El ID de ${label} no es válido.`,
    );
  }

  return id;
}

export function readCalendarDate(
  value: unknown,
): string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new WorkShiftError(
      400,
      "La fecha debe tener el formato AAAA-MM-DD.",
    );
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new WorkShiftError(
      400,
      "La fecha no es válida.",
    );
  }

  return value;
}

function readPayload(
  body: unknown,
  current?: WorkShiftRecord,
): CreateWorkShiftDto {
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    throw new WorkShiftError(
      400,
      "Los datos del turno no son válidos.",
    );
  }

  const source = body as Record<string, unknown>;

  if (
    current &&
    !["employeeId", "workShiftTypeId", "date", "notes"].some(
      (field) => source[field] !== undefined,
    )
  ) {
    throw new WorkShiftError(
      400,
      "No se enviaron campos para actualizar.",
    );
  }

  const employeeId = readPositiveId(
    source.employeeId === undefined
      ? current?.employeeId
      : source.employeeId,
    "empleado",
  );

  const workShiftTypeId = readPositiveId(
    source.workShiftTypeId === undefined
      ? current?.workShiftTypeId
      : source.workShiftTypeId,
    "jornada",
  );

  const date = readCalendarDate(
    source.date === undefined
      ? current?.date.toISOString().slice(0, 10)
      : source.date,
  );

  const notesValue = source.notes === undefined
    ? current?.notes ?? null
    : source.notes;

  if (
    notesValue !== null &&
    (
      typeof notesValue !== "string" ||
      notesValue.length > 500
    )
  ) {
    throw new WorkShiftError(
      400,
      "Las observaciones deben tener hasta 500 caracteres.",
    );
  }

  return {
    employeeId,
    workShiftTypeId,
    date,
    notes: typeof notesValue === "string"
      ? notesValue.trim() || null
      : null,
  };
}

async function validateReferences(
  data: CreateWorkShiftDto,
  current?: WorkShiftRecord,
): Promise<void> {
  const [employee, journey] = await Promise.all([
    prisma.employee.findUnique({
      where: { id: data.employeeId },
      select: {
        isActive: true,
        user: {
          select: {
            isActive: true,
          },
        },
      },
    }),

    prisma.workShiftType.findUnique({
      where: { id: data.workShiftTypeId },
      select: {
        isActive: true,
      },
    }),
  ]);

  if (!employee) {
    throw new WorkShiftError(
      404,
      "Empleado no encontrado.",
    );
  }

  if (!journey) {
    throw new WorkShiftError(
      404,
      "Jornada no encontrada.",
    );
  }

  const assigningEmployee =
    !current ||
    current.employeeId !== data.employeeId ||
    current.date.toISOString().slice(0, 10) !== data.date;

  if (
    assigningEmployee &&
    (
      !employee.isActive ||
      employee.user?.isActive === false
    )
  ) {
    throw new WorkShiftError(
      400,
      "No se pueden asignar turnos a un empleado desactivado.",
    );
  }

  const assigningJourney =
    !current ||
    current.workShiftTypeId !== data.workShiftTypeId ||
    current.date.toISOString().slice(0, 10) !== data.date;

  if (assigningJourney && !journey.isActive) {
    throw new WorkShiftError(
      400,
      "La jornada seleccionada está desactivada.",
    );
  }
}

export async function getWorkShifts(
  fromValue: unknown,
  toValue: unknown,
): Promise<WorkShift[]> {
  const from = readCalendarDate(fromValue);
  const to = readCalendarDate(toValue);

  if (from > to) {
    throw new WorkShiftError(
      400,
      "La fecha inicial no puede ser posterior a la final.",
    );
  }

  const records = await prisma.workShift.findMany({
    where: {
      date: {
        gte: new Date(`${from}T00:00:00.000Z`),
        lte: new Date(`${to}T00:00:00.000Z`),
      },
    },
    include: workShiftInclude,
    orderBy: [
      { date: "asc" },
      { employeeId: "asc" },
      { id: "asc" },
    ],
  });

  return records.map(serializeWorkShift);
}

export async function getWorkShiftById(
  id: number,
): Promise<WorkShift> {
  const record = await prisma.workShift.findUnique({
    where: { id },
    include: workShiftInclude,
  });

  if (!record) {
    throw new WorkShiftError(
      404,
      "Turno no encontrado.",
    );
  }

  return serializeWorkShift(record);
}

export async function createWorkShift(
  body: unknown,
): Promise<WorkShift> {
  const data = readPayload(body);

  await validateReferences(data);

  const record = await prisma.workShift.create({
    data: {
      employeeId: data.employeeId,
      workShiftTypeId: data.workShiftTypeId,
      date: new Date(`${data.date}T00:00:00.000Z`),
      notes: data.notes ?? null,
    },
    include: workShiftInclude,
  });

  return serializeWorkShift(record);
}

export async function updateWorkShift(
  id: number,
  body: unknown,
): Promise<WorkShift> {
  const current = await prisma.workShift.findUnique({
    where: { id },
    include: workShiftInclude,
  });

  if (!current) {
    throw new WorkShiftError(
      404,
      "Turno no encontrado.",
    );
  }

  const data = readPayload(body, current);

  await validateReferences(data, current);

  const record = await prisma.workShift.update({
    where: { id },
    data: {
      employeeId: data.employeeId,
      workShiftTypeId: data.workShiftTypeId,
      date: new Date(`${data.date}T00:00:00.000Z`),
      notes: data.notes ?? null,
    },
    include: workShiftInclude,
  });

  return serializeWorkShift(record);
}

export async function deleteWorkShift(
  id: number,
): Promise<void> {
  await prisma.workShift.delete({
    where: { id },
  });
}
