import type { Request, Response } from "express";
import type { LoginDto } from "@almacen/shared";

import {
  AuthError,
  createOwner,
  getSetupStatus,
  login,
} from "./auth.service.js";

function readCredentials(
  body: unknown,
  creatingAccount: boolean,
): LoginDto {
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("email" in body) ||
    !("password" in body)
  ) {
    throw new AuthError(
      400,
      "Debés ingresar email y contraseña.",
    );
  }

  if (
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    throw new AuthError(
      400,
      "El email y la contraseña deben ser textos.",
    );
  }

  const email = body.email.trim().toLowerCase();
  const password = body.password;

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new AuthError(
      400,
      "Ingresá un email válido.",
    );
  }

  if (password.length === 0 || password.length > 128) {
    throw new AuthError(
      400,
      "La contraseña debe tener entre 1 y 128 caracteres.",
    );
  }

  if (creatingAccount && password.length < 8) {
    throw new AuthError(
      400,
      "La contraseña debe tener al menos 8 caracteres.",
    );
  }

  return {
    email,
    password,
  };
}

function respondWithError(
  res: Response,
  error: unknown,
): void {
  if (error instanceof AuthError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  console.error("Error de autenticación:", error);

  res.status(500).json({
    message: "No se pudo completar la operación.",
  });
}

export async function getSetupStatusController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const status = await getSetupStatus();
    res.json(status);
  } catch (error) {
    respondWithError(res, error);
  }
}

export async function createOwnerController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const credentials = readCredentials(req.body, true);
    const user = await createOwner(credentials);

    res.status(201).json({
      user,
    });
  } catch (error) {
    respondWithError(res, error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const credentials = readCredentials(req.body, false);
    const user = await login(credentials);

    res.json({
      user,
    });
  } catch (error) {
    respondWithError(res, error);
  }
}