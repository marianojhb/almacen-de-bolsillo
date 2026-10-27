import type { CreateBalanceDto } from "@almacen/shared";

export class BalanceInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BalanceInputError";
  }
}

const allowedFields = new Set([
  "userId", "date", "opening", "cashIn", "cashOut",
  "expectedClosing", "actualClosing", "difference", "movementType",
]);

function readAmount(value: unknown, label: string, allowNegative = false): number {
  if (typeof value !== "number" || !Number.isFinite(value) || (!allowNegative && value < 0)) {
    throw new BalanceInputError(
      `El importe de ${label} debe ser un número finito${allowNegative ? "." : " mayor o igual a cero."}`,
    );
  }
  return value;
}

function readDate(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  ) {
    throw new BalanceInputError("Ingresá una fecha de cierre válida en formato ISO con zona horaria.");
  }

  const date = new Date(value);
  const calendarDate = value.slice(0, 10);
  const calendar = new Date(`${calendarDate}T00:00:00.000Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    !Number.isFinite(calendar.getTime()) ||
    calendar.toISOString().slice(0, 10) !== calendarDate ||
    Number(value.slice(11, 13)) > 23
  ) {
    throw new BalanceInputError("Ingresá una fecha de cierre válida.");
  }
  return date.toISOString();
}

export function parseCreateBalanceInput(input: unknown): CreateBalanceDto {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new BalanceInputError("Enviá los datos del cierre como un objeto.");
  }

  const source = input as Record<string, unknown>;
  if (Object.keys(source).some((field) => !allowedFields.has(field))) {
    throw new BalanceInputError("Enviá únicamente los campos permitidos del cierre.");
  }

  const userId = source.userId;
  if (typeof userId !== "number" || !Number.isSafeInteger(userId) || userId <= 0) {
    throw new BalanceInputError("El identificador del usuario debe ser un entero positivo.");
  }

  const movementType = source.movementType;
  if (movementType !== "C" && movementType !== "R") {
    throw new BalanceInputError("El tipo de movimiento debe ser C (capital) o R (resultados).");
  }

  return {
    userId,
    date: readDate(source.date),
    opening: readAmount(source.opening, "apertura"),
    cashIn: readAmount(source.cashIn, "entradas de efectivo"),
    cashOut: readAmount(source.cashOut, "salidas de efectivo"),
    expectedClosing: readAmount(source.expectedClosing, "efectivo esperado", true),
    actualClosing: readAmount(source.actualClosing, "efectivo real"),
    difference: readAmount(source.difference, "diferencia", true),
    movementType,
  };
}
