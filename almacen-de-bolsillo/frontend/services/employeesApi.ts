import type { CreateEmployeeDto, Employee, UpdateEmployeeDto } from "@almacen/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const error = await response.json();

    return error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getEmployeesRequest(): Promise<Employee[]> {
  const response = await fetch(`${API_URL}/employees?includeInactive=true`,);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "No se pudieron obtener los empleados."),
    );
  }

  return response.json();
}

export async function createEmployeeRequest(employee: CreateEmployeeDto): Promise<Employee> {
  const response = await fetch(`${API_URL}/employees`,
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
  const response = await fetch(`${API_URL}/employees/${employeeId}`,
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
  const response = await fetch(`${API_URL}/employees/${employeeId}`,
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
  const response = await fetch(`${API_URL}/employees/${employeeId}/permanent`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "No se pudo eliminar definitivamente al empleado."),
    );
  }
}