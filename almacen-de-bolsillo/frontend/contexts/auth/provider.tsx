import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import type { AuthSessionInfo, LoginDto } from "@almacen/shared";
import { AuthContext } from "./context";
import { getSessionRequest, loginRequest, logoutRequest } from "@/services/authApi";
import { deleteStoredToken, getStoredToken, storeToken } from "@/services/authStorage";
import { ApiError, setApiToken, setUnauthorizedHandler, setForbiddenHandler } from "@/services/apiClient";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSessionInfo | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [restorationError, setRestorationError] = useState<string | null>(null);
  // Cada cambio de sesión aumenta esta versión. Una respuesta anterior se ignora
  // si el usuario ya cerró sesión o inició otra mientras esperaba al servidor.
  const sessionVersion = useRef(0);
  // Comparte una consulta en curso para no pedir la misma sesión varias veces a la vez.
  const refreshRequest = useRef<Promise<void> | null>(null);
  const hasSession = session !== null;

  const clearSession = useCallback(async () => {
    sessionVersion.current += 1;
    refreshRequest.current = null;
    setIsRestoring(true);
    setRestorationError(null);
    setApiToken(null);
    setSession(null);
    try {
      await deleteStoredToken();
    } catch (error) {
      setRestorationError("No se pudo borrar la sesión guardada. Intentá nuevamente.");
      throw error;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  // Al abrir la app recuperamos el token, pero el backend debe comprobarlo antes
  // de mostrar una sesión como válida. Tener un token guardado no garantiza acceso.
  const retrySession = useCallback(async () => {
    const version = ++sessionVersion.current;
    setIsRestoring(true);
    setRestorationError(null);
    try {
      const token = await getStoredToken();
      if (version !== sessionVersion.current) return;
      setApiToken(token);
      if (!token) {
        setSession(null);
        return;
      }
      const restoredSession = await getSessionRequest();
      if (version === sessionVersion.current) setSession(restoredSession);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return;
      }
      if (version === sessionVersion.current) {
        setRestorationError(error instanceof Error ? error.message : "No se pudo recuperar la sesión.");
      }
    } finally {
      if (version === sessionVersion.current) setIsRestoring(false);
    }
  }, []);

  const refreshSession = useCallback((): Promise<void> => {
    if (!hasSession) return Promise.resolve();
    if (refreshRequest.current) return refreshRequest.current;
    const version = sessionVersion.current;
    const request = getSessionRequest().then((currentSession) => {
      if (version === sessionVersion.current) {
        // Si no cambió ningún dato, conservamos el objeto y evitamos actualizar
        // innecesariamente las pantallas que consumen este contexto.
        setSession((current) => JSON.stringify(current) === JSON.stringify(currentSession) ? current : currentSession);
      }
    }).catch(() => {
      // Un fallo de conexión no cierra la cuenta. Si fue un 401, apiClient ya
      // notificó a clearSession mediante el manejador de sesión inválida.
    }).finally(() => {
      if (refreshRequest.current === request) refreshRequest.current = null;
    });
    refreshRequest.current = request;
    return request;
  }, [hasSession]);

  // Mientras la app está activa actualizamos permisos y datos cada 30 segundos.
  // Un 403 también pide una actualización, pero no significa cerrar sesión.
  useEffect(() => {
    setForbiddenHandler(() => { void refreshSession(); });
    const interval = setInterval(() => {
      if (AppState.currentState === "active") void refreshSession();
    }, 30000);
    return () => { clearInterval(interval); setForbiddenHandler(null); };
  }, [refreshSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession().catch(() => {
        setRestorationError("No se pudo borrar la sesión guardada. Intentá nuevamente.");
      });
    });
    void retrySession();
    return () => {
      sessionVersion.current += 1;
      setUnauthorizedHandler(null);
      setApiToken(null);
    };
  }, [clearSession, retrySession]);

  // El temporizador limpia la sesión al vencer. Al volver del segundo plano
  // se revisa otra vez porque el sistema puede haber pausado los temporizadores.
  useEffect(() => {
    if (!session) return;
    const expireSession = () => {
      void clearSession().catch(() => {
        setRestorationError("No se pudo borrar la sesión vencida. Intentá nuevamente.");
      });
    };
    const timeout = setTimeout(expireSession, Math.max(0, Date.parse(session.expiresAt) - Date.now()));
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      if (Date.parse(session.expiresAt) <= Date.now()) {
        expireSession();
        return;
      }
      void refreshSession();
    });
    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [session, clearSession, refreshSession]);

  const signIn = async (data: LoginDto) => {
    const result = await loginRequest(data);
    setApiToken(result.token);
    try {
      await storeToken(result.token);
    } catch {
      // Si falló el guardado local, intentamos revocar la sesión recién creada
      // antes de informar que el inicio de sesión no se pudo completar.
      try { await logoutRequest(); } catch { /* No guardar una sesión que no pudo persistirse. */ }
      setApiToken(null);
      throw new Error("No se pudo guardar la sesión en el dispositivo. Intentá nuevamente.");
    }
    sessionVersion.current += 1;
    refreshRequest.current = null;
    setRestorationError(null);
    setSession(result.session);
  };

  const signOut = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
    }
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ session, isRestoring, restorationError, signIn, signOut, retrySession, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}
