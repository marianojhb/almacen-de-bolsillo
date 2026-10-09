import { createHash, randomBytes } from "node:crypto";

// La sesión dura 12 horas desde el login; consultar la app no renueva este plazo.
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

// Credencial aleatoria de 32 bytes (64 caracteres hexadecimales). No es un JWT:
// no lleva datos ni permisos dentro; identifica una sesión guardada en la base.
const createSessionToken = (): string => randomBytes(32).toString("hex");

// El mismo token produce el mismo hash, por eso podemos buscarlo al recibirlo.
// Esto no sustituye Argon2 para contraseñas: aquí el token ya es aleatorio y largo.
const hashSessionToken = (token: string): string => createHash("sha256").update(token).digest("hex");

const isValidSessionToken = (token: string): boolean => /^[a-f0-9]{64}$/.test(token);

export { SESSION_DURATION_MS, createSessionToken, hashSessionToken, isValidSessionToken };
