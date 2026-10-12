import { API_URL } from "@/constants/api";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = (process.env.EXPO_PUBLIC_API_URL || API_URL).replace(/\/$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${baseUrl}${path}`, { ...options, signal: controller.signal });
    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
        ? body.message
        : "No se pudo completar la operación.";
      throw new ApiError(response.status, message);
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(controller.signal.aborted
      ? "El servidor tardó demasiado en responder. Volvé a intentar."
      : "No se pudo conectar con el servidor. Revisá tu conexión y que el backend esté funcionando.");
  } finally {
    clearTimeout(timeout);
  }
}
