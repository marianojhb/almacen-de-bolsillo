export type MeasurementUnit = "UNIT" | "BOX" | "KILOGRAM" | "LITER";

export const MEASUREMENT_UNITS: { value: MeasurementUnit; label: string; symbol: string; priceLabel: string }[] = [
  { value: "UNIT", label: "Unidades", symbol: "un", priceLabel: "unidad" },
  { value: "BOX", label: "Cajas", symbol: "caja", priceLabel: "caja" },
  { value: "KILOGRAM", label: "Kilogramos", symbol: "kg", priceLabel: "kg" },
  { value: "LITER", label: "Litros", symbol: "l", priceLabel: "litro" },
];

export const isMeasurementUnit = (value: unknown): value is MeasurementUnit => MEASUREMENT_UNITS.some((unit) => unit.value === value);
export const allowsFractionalQuantity = (unit: MeasurementUnit) => unit === "KILOGRAM" || unit === "LITER";
export const getMeasurementUnit = (unit: MeasurementUnit) => MEASUREMENT_UNITS.find((option) => option.value === unit)!;

// Límites de DECIMAL(12,2) y DECIMAL(12,3). No redondear entradas inválidas silenciosamente.
export function isValidDecimal(value: unknown, scale: 2 | 3, signed = false): value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || (!signed && value < 0)) return false;
  const factor = 10 ** scale;
  const scaled = Math.abs(value) * factor;
  return Math.abs(value) <= (10 ** 12 - 1) / factor
    && Math.abs(scaled - Math.round(scaled)) <= Number.EPSILON * Math.max(1, scaled) * 4;
}

export function isValidProductQuantity(value: unknown, unit: MeasurementUnit, signed = false): value is number {
  return isValidDecimal(value, 3, signed) && (allowsFractionalQuantity(unit) || Number.isInteger(value));
}

// Entrada sin separadores de miles; se admite coma o punto como separador decimal.
export function parseDecimalInput(value: string): number {
  const text = value.trim();
  return /^\d+(?:[.,]\d+)?$/.test(text) ? Number(text.replace(",", ".")) : NaN;
}

export function formatProductQuantity(value: number, unit: MeasurementUnit): string {
  return `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: allowsFractionalQuantity(unit) ? 3 : 0 }).format(value)} ${getMeasurementUnit(unit).symbol}`;
}
