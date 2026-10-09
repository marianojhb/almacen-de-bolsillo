import type {
  AuthSessionInfo,
  LoginDto,
  LoginResponse,
  RegisterCommerceDto,
  RegisterCommerceResponse,
} from "@almacen/shared";
import { ApiError, apiFetch } from "./apiClient";

async function checkResponse(response: Response, fallback: string): Promise<void> {
  if (response.ok) return;
  let message = fallback;
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") {
      message = body.message;
    }
  } catch {
    
  }
  throw new ApiError(message, response.status);
}

export async function loginRequest(data: LoginDto): Promise<LoginResponse> {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }, false);
  await checkResponse(response, "No se pudo iniciar sesión.");
  return response.json();
}

export async function registerCommerceRequest(data: RegisterCommerceDto): Promise<RegisterCommerceResponse> {
  const response = await apiFetch("/auth/register-commerce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }, false);
  await checkResponse(response, "No se pudo registrar el comercio.");
  return response.json();
}

export async function getSessionRequest(): Promise<AuthSessionInfo> {
  const response = await apiFetch("/auth/me");
  await checkResponse(response, "No se pudo consultar la sesión.");
  return response.json();
}

export async function logoutRequest(): Promise<void> {
  const response = await apiFetch("/auth/logout", { method: "POST" });
  await checkResponse(response, "No se pudo cerrar la sesión.");
}
