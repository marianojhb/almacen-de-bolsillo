const API_URL = process.env.EXPO_PUBLIC_API_URL;

let sessionToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;
let forbiddenHandler: (() => void) | null = null;

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export function setApiToken(token: string | null) {
  sessionToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function setForbiddenHandler(handler: (() => void) | null) {
  forbiddenHandler = handler;
}

export async function apiFetch(path: string, options: RequestInit = {}, authenticated = true): Promise<Response> {
  if (!API_URL) {
    throw new Error("Falta configurar la dirección del backend en EXPO_PUBLIC_API_URL.");
  }

  // Conservamos el token con el que empieza esta petición para detectar si
  // la cuenta cambia mientras el servidor está respondiendo.
  const requestToken = authenticated ? sessionToken : null;
  if (authenticated && !requestToken) {
    throw new ApiError("Iniciá sesión para continuar.", 401);
  }

  const headers = new Headers(options.headers);
  // Bearer es el formato del encabezado que lee requireAuth en el backend.
  // El token es una credencial: no se debe imprimir en logs ni compartir.
  if (requestToken) headers.set("Authorization", `Bearer ${requestToken}`);

  const controller = new AbortController();
  const abortRequest = () => controller.abort();
  if (options.signal?.aborted) controller.abort();
  options.signal?.addEventListener("abort", abortRequest);
  const timeout = setTimeout(abortRequest, 20000);

  try {
    const response = await fetch(`${API_URL.replace(/\/$/, "")}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });


    // Una respuesta de la cuenta anterior no debe reutilizarse en la nueva sesión
    // ni provocar que un 401 antiguo cierre la cuenta que acaba de iniciar sesión.
    if (authenticated && requestToken !== sessionToken) {
      throw new ApiError("La sesión cambió. Intentá nuevamente.", 401);
    }

    if (authenticated && response.status === 401) {
      unauthorizedHandler?.();
      throw new ApiError("La sesión no es válida o venció. Iniciá sesión nuevamente.", 401);
    }

    if (authenticated && response.status === 403) forbiddenHandler?.();
    return response;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("La solicitud se interrumpió o tardó demasiado. Revisá la conexión e intentá nuevamente.");
    }
    if (error instanceof ApiError) throw error;
    throw new Error("No se pudo conectar con el servidor. Revisá la conexión e intentá nuevamente.");
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abortRequest);
  }
}
