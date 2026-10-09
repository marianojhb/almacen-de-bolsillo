import type { CommerceRoleDto, CreateCommerceRoleDto, UpdateCommerceRoleDto, PermissionDto } from "@almacen/shared";
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

export async function getRolesRequest(): Promise<CommerceRoleDto[]> {
  return readResponse<CommerceRoleDto[]>(await apiFetch("/roles"), "No se pudieron obtener los roles.");
}

export async function deleteRoleRequest(id: number): Promise<void> {
  return readResponse<void>(await apiFetch(`/roles/${id}`, { method: "DELETE" }), "No se pudo eliminar el rol.");
}

export async function createRoleRequest(data: CreateCommerceRoleDto): Promise<CommerceRoleDto> {
  return readResponse<CommerceRoleDto>(await apiFetch("/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "No se pudo crear el rol.");
}

export async function updateRoleRequest(id: number, data: UpdateCommerceRoleDto): Promise<CommerceRoleDto> {
  return readResponse<CommerceRoleDto>(await apiFetch(`/roles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }), "No se pudo actualizar el rol.");
}

export async function getPermissionsRequest(): Promise<PermissionDto[]> {
  return readResponse<PermissionDto[]>(await apiFetch("/roles/permissions"), "No se pudo obtener el catálogo de permisos.");
}
