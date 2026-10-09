import type { NextFunction, Request, Response } from "express";
import { getAuthSessionFromDatabase } from "./auth.service.js";
import type { AuthenticatedSession } from "./auth.service.js";

// Se ejecuta antes del controlador de una ruta protegida. Comprueba quién accede;
// los permisos para cada acción se comprueban después con requirePermission.
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-store");

  const authorization = req.get("Authorization");
  const match = authorization?.match(/^Bearer ([a-f0-9]{64})$/i);
  const token = match?.[1];

  if (!token) {
    res.status(401).json({ message: "Iniciá sesión para continuar." });
    return;
  }

  try {
    const authentication = await getAuthSessionFromDatabase(token);
    if (!authentication) {
      res.status(401).json({ message: "La sesión no es válida o venció. Iniciá sesión nuevamente." });
      return;
    }

    // res.locals comparte datos entre los pasos de esta petición, no entre usuarios.
    // next() continúa hacia el siguiente middleware o controlador.
    res.locals.auth = authentication;
    next();
  } catch {
    console.error("No se pudo comprobar la sesión.");
    res.status(500).json({ message: "No se pudo comprobar la sesión. Intentá nuevamente." });
  }
};

// 401: falta una sesión válida. 403: hay sesión, pero falta el permiso solicitado.
const requirePermission = (permission: string) =>
  (_req: Request, res: Response, next: NextFunction) => {
    const authentication = res.locals.auth as AuthenticatedSession | undefined;
    if (!authentication) {
      res.status(401).json({ message: "Iniciá sesión para continuar." });
      return;
    }
    if (!authentication.session.permissions.includes(permission)) {
      res.status(403).json({ message: "No tenés permiso para realizar esta acción." });
      return;
    }
    next();
  };

const requireAnyPermission = (...permissions: string[]) =>
  (_req: Request, res: Response, next: NextFunction) => {
    const session = getRequestSession(res);
    if (!permissions.some((code) => session.permissions.includes(code))) {
      res.status(403).json({ message: "No tenés permiso para consultar estos datos." });
      return;
    }
    next();
  };


// Los controladores toman el comercio y usuario de la sesión comprobada,
// en lugar de confiar en un commerceId que envíe el cliente.
const getRequestSession = (res: Response) => {
  const authentication = res.locals.auth as AuthenticatedSession | undefined;
  if (!authentication) throw new Error("Esta operación requiere el middleware de autenticación.");
  return authentication.session;
};

export { requireAuth, requirePermission, requireAnyPermission, getRequestSession };
