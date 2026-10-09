import type { CreateEmployeeDto, Employee, UpdateEmployeeDto } from "@almacen/shared";

import { apiFetch } from "./apiClient";

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const error = await response.json();

    return error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getEmployeesRequest(): Promise<Employee[]> {
  const response = await apiFetch(`/employees?includeInactive=true`,);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "No se pudieron obtener los empleados."),
    );
  }

  return response.json();
}

export async function createEmployeeRequest(employee: CreateEmployeeDto): Promise<Employee> {
  const response = await apiFetch(`/employees`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employee),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response,"No se pudo registrar el empleado."),
    );
  }

  return response.json();
}

export async function updateEmployeeRequest(employeeId: number, employee: UpdateEmployeeDto): Promise<Employee> {
  const response = await apiFetch(`/employees/${employeeId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employee),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "No se pudo actualizar el empleado."),
    );
  }

  return response.json();
}

export async function deactivateEmployeeRequest(employeeId: number): Promise<void> {
  const response = await apiFetch(`/employees/${employeeId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "No se pudo dar de baja al empleado."),
    );
  }
}

export async function permanentlyDeleteEmployeeRequest(employeeId: number): Promise<void> {
  const response = await apiFetch(`/employees/${employeeId}/permanent`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "No se pudo eliminar definitivamente al empleado."),
    );
  }
}
