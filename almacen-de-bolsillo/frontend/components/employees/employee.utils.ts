import type { Employee } from "@almacen/shared";

export function formatEmployeeCode(commerceEmployeeId: number): string {
    return `EMP-${commerceEmployeeId.toString().padStart(4, "0")}`;
}

export function getEmployeeName(employee: Employee): string {
  return (
        employee.fullname?.trim() ||
        `${employee.firstname ?? ""} ${employee.lastname ?? ""}`.trim() ||
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
