import type { CreateWorkShiftTypeDto } from "@almacen/shared";
import { prisma } from "../../config/prisma.js";

export class WorkShiftError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "WorkShiftError";
  }
}

function readPayload(body: unknown): Record<string, unknown> {
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    throw new WorkShiftError(
      400,
      "Los datos de la jornada no son válidos.",
    );
  }

  return body as Record<string, unknown>;
}

function validateFields(
  source: Record<string, unknown>,
): CreateWorkShiftTypeDto {
  if (
    typeof source.name !== "string" ||
    !source.name.trim() ||
    source.name.trim().length > 60
  ) {
    throw new WorkShiftError(
      400,
      "Ingresá un nombre de jornada de hasta 60 caracteres.",
    );
  }

  if (typeof source.isNonWorkingDay !== "boolean") {
    throw new WorkShiftError(
      400,
      "Indicá si la jornada es no laboral.",
    );
  }

  if (
    typeof source.color !== "string" ||
    !/^#[a-f0-9]{6}$/i.test(source.color)
  ) {
    throw new WorkShiftError(
      400,
      "Seleccioná un color válido.",
    );
  }

  const name = source.name.trim();
  const color = source.color.toUpperCase();

  if (source.isNonWorkingDay) {
    return {
      name,
      color,
      isNonWorkingDay: true,
      startTime: null,
      endTime: null,
    };
  }

  const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (
    typeof source.startTime !== "string" ||
    typeof source.endTime !== "string" ||
    !validTime.test(source.startTime) ||
    !validTime.test(source.endTime)
  ) {
    throw new WorkShiftError(
      400,
      "Los horarios deben tener el formato HH:mm.",
    );
  }

  if (source.startTime === source.endTime) {
    throw new WorkShiftError(
      400,
      "El inicio y el fin no pueden ser iguales.",
    );
  }

  return {
    name,
    color,
    isNonWorkingDay: false,
    startTime: source.startTime,
    endTime: source.endTime,
  };
}

export async function getWorkShiftTypes(
  includeInactive: boolean,
) {
  return prisma.workShiftType.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function createWorkShiftType(body: unknown) {
  const data = validateFields(readPayload(body));

  return prisma.workShiftType.create({
    data,
  });
}

export async function updateWorkShiftType(
  id: number,
  body: unknown,
) {
  const source = readPayload(body);

  const editableFields = [
    "name",
    "isNonWorkingDay",
    "startTime",
    "endTime",
    "color",
    "isActive",
  ];

  if (
    !editableFields.some(
      (field) => source[field] !== undefined,
    )
  ) {
    throw new WorkShiftError(
      400,
      "No se enviaron campos para actualizar.",
    );
  }

  const current = await prisma.workShiftType.findUnique({
    where: { id },
  });

  if (!current) {
    throw new WorkShiftError(
      404,
      "Jornada no encontrada.",
    );
  }

  if (
    source.isActive !== undefined &&
    typeof source.isActive !== "boolean"
  ) {
    throw new WorkShiftError(
      400,
      "El estado de la jornada no es válido.",
    );
  }

  const data = validateFields({
    name:
      source.name === undefined
        ? current.name
        : source.name,

    isNonWorkingDay:
      source.isNonWorkingDay === undefined
        ? current.isNonWorkingDay
        : source.isNonWorkingDay,

    startTime:
      source.startTime === undefined
        ? current.startTime
        : source.startTime,

    endTime:
      source.endTime === undefined
        ? current.endTime
        : source.endTime,

    color:
      source.color === undefined
        ? current.color
        : source.color,
  });

  return prisma.workShiftType.update({
    where: { id },
    data: {
      ...data,
      ...(typeof source.isActive === "boolean" && {
        isActive: source.isActive,
      }),
    },
  });
}

export async function deactivateWorkShiftType(id: number) {
  return prisma.workShiftType.update({
    where: { id },
    data: { isActive: false },
  });
}