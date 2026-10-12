import type { CreateWorkShiftDto } from "@almacen/shared";

export type AssignmentResult = {
  savedDates: string[];
  failures: { date: string; message: string }[];
};

// Conserva los resultados parciales para reintentar solo las fechas pendientes.
export async function assignWorkShiftDates(
  assignments: CreateWorkShiftDto[],
  assign: (data: CreateWorkShiftDto) => Promise<unknown>,
): Promise<AssignmentResult> {
  const result: AssignmentResult = { savedDates: [], failures: [] };
  const seen = new Set<string>();
  for (const data of assignments) {
    const key = `${data.employeeId}:${data.date}`;
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      await assign(data);
      result.savedDates.push(data.date);
    } catch (error) {
      result.failures.push({ date: data.date, message: error instanceof Error ? error.message : "No se pudo asignar el turno." });
    }
  }
  return result;
}
