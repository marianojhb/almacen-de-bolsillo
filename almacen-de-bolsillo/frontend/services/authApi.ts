import type { AuthResponse, LoginDto, SetupStatus } from "@almacen/shared";
import { apiRequest } from "./apiClient";

export function getSetupStatusRequest(): Promise<SetupStatus> {
  return apiRequest("/auth/setup-status");
}

export function loginRequest(credentials: LoginDto): Promise<AuthResponse> {
  return apiRequest("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export function createOwnerRequest(credentials: LoginDto): Promise<AuthResponse> {
  return apiRequest("/auth/create-owner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}
