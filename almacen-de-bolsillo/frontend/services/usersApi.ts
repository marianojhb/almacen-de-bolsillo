import type { CommerceUserDto, CreateCommerceUserDto, UpdateCommerceUserDto, EmployeeAccountOption } from "@almacen/shared";
import { apiFetch, ApiError } from "./apiClient";

async function readResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    let message = fallback;
    try {
      const body: unknown = await response.json();
      if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") {
        message = body.message;
      }
    } catch { /* Conservar el mensaje general si la respuesta no contiene JSON. */ }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function getUsersRequest(): Promise<CommerceUserDto[]> {
  return readResponse<CommerceUserDto[]>(await apiFetch("/users"), "No se pudieron obtener los usuarios.");
}

export async function getEmployeeAccountOptionsRequest(): Promise<EmployeeAccountOption[]> {
  return readResponse<EmployeeAccountOption[]>(await apiFetch("/users/employee-options"), "No se pudieron obtener los empleados disponibles.");
}

export async function deleteUserRequest(id: number): Promise<void> {
  return readResponse<void>(await apiFetch(`/users/${id}`, { method: "DELETE" }), "No se pudo eliminar el usuario.");
}

export async function createUserRequest(data: CreateCommerceUserDto): Promise<CommerceUserDto> {
  return readResponse<CommerceUserDto>(await apiFetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "No se pudo crear el usuario.");
}

export async function updateUserRequest(id: number, data: UpdateCommerceUserDto): Promise<CommerceUserDto> {
  return readResponse<CommerceUserDto>(await apiFetch(`/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "No se pudo actualizar el usuario.");
}
