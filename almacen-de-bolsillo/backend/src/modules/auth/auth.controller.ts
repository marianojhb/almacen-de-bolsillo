import type { Request, Response } from "express";
import type { AuthenticatedSession } from "./auth.service.js";
import { registerCommerceInDatabase, loginToDatabase, revokeAuthSessionFromDatabase } from "./auth.service.js";
import { validateRegisterCommerce, validateLogin } from "./auth.validation.js";
import { ApiError } from "./request.utils.js";

const registerCommerce = async (req: Request, res: Response) => {
  const validation = validateRegisterCommerce(req.body);

  if (!validation.ok) {
    res.status(400).json({ message: validation.message });
    return;
  }

  try {
    const registration = await registerCommerceInDatabase(validation.data);

    if (registration === null) {
      res.status(409).json({message: "El usuario del comercio ya está registrado."});
      return;
    }

    res.status(201).json(registration);
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : null;

    if (code === "P2002") {
      res.status(409).json({message: "El usuario del comercio ya está registrado."});
      return;
    }

    console.error("Error registrando el comercio. Código:", code ?? "desconocido");
    res.status(500).json({ message: "No se pudo registrar el comercio. Intentá nuevamente." });
  }
};

const login = async (req: Request, res: Response) => {
  res.set("Cache-Control", "no-store");
  const validation = validateLogin(req.body);

  if (!validation.ok) {
    res.status(400).json({ message: validation.message });
    return;
  }

  try {
    const result = await loginToDatabase(validation.data);
    if (!result) {
      res.status(401).json({ message: "Los datos de acceso no son válidos o la cuenta no está habilitada." });
      return;
    }

    res.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    console.error("No se pudo completar el inicio de sesión.");
    res.status(500).json({ message: "No se pudo iniciar sesión. Intentá nuevamente." });
  }
};

const getCurrentSession = (_req: Request, res: Response) => {
  const authentication = res.locals.auth as AuthenticatedSession | undefined;
  if (!authentication) {
    res.status(401).json({ message: "Iniciá sesión para continuar." });
    return;
  }

  res.json(authentication.session);
};

const logout = async (_req: Request, res: Response) => {
  const authentication = res.locals.auth as AuthenticatedSession | undefined;
  if (!authentication) {
    res.status(401).json({ message: "Iniciá sesión para continuar." });
    return;
  }

  try {
    await revokeAuthSessionFromDatabase(authentication.sessionId, authentication.tokenHash);
    res.status(204).send();
  } catch {
    console.error("No se pudo cerrar la sesión.");
    res.status(500).json({ message: "No se pudo cerrar la sesión. Intentá nuevamente." });
  }
};

export { registerCommerce, login, getCurrentSession, logout };
