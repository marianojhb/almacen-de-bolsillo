import type { Employee } from "@almacen/shared";
import { formatFullName } from "@almacen/shared";

export function formatEmployeeCode(id: number): string {
    return `EMP-${id.toString().padStart(6, "0")}`;
}

export function getEmployeeName(employee: Employee): string {
  return (
        formatFullName(employee.firstname, employee.lastname) ||
        "Empleado sin nombre"
    );
}

export function formatEmployeeDate(value: string | null): string | null {
    if (!value) return null;

    return new Date(value).toLocaleDateString("es-AR", { timeZone: "UTC" });
}

export const employeeGenderLabels: Record<Employee["gender"], string> = {
    M: "Masculino",
    F: "Femenino",
    OTHER: "Otro",
};
