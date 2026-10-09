import type { Response } from "express";
import { PAYMENT_METHODS, WALLET_PROVIDERS, type PaymentMethod, type WalletProvider } from "@almacen/shared";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const readBody = (body: unknown, fields: readonly string[]): Record<string, unknown> => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Los datos enviados no son válidos.");
  }
  const data = body as Record<string, unknown>;
  if (!Object.keys(data).length || Object.keys(data).some((key) => !fields.includes(key))) {
    throw new ApiError(400, "Se enviaron campos no permitidos o ningún campo para modificar.");
  }
  return data;
};

const readId = (value: unknown): number => {
  const id = typeof value === "string" ? Number(value) : value;
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    throw new ApiError(400, "El identificador no es válido.");
  }
  return id;
};

const readNumber = (value: unknown, name: string, min = 0, max = 99999999.99): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new ApiError(400, `El campo ${name} no es válido.`);
  }
  return value;
};

const readInteger = (value: unknown, name: string, min = 0): number => {
  const number = readNumber(value, name, min, 2147483647);
  if (!Number.isInteger(number)) throw new ApiError(400, `El campo ${name} debe ser entero.`);
  return number;
};

const readText = (value: unknown, name: string, max = 255, allowEmpty = false): string => {
  if (typeof value !== "string" || value.trim().length > max || (!allowEmpty && !value.trim())) {
    throw new ApiError(400, `El campo ${name} no es válido.`);
  }
  return value.trim();
};

const readDate = (value: unknown): Date => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) {
    throw new ApiError(400, "La fecha no es válida.");
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value.slice(0, 10)) {
    throw new ApiError(400, "La fecha no es válida.");
  }
  return date;
};

const readBoolean = (value: unknown): boolean => {
  if (typeof value !== "boolean") throw new ApiError(400, "El estado no es válido.");
  return value;
};

const readPaymentMethod = (value: unknown): PaymentMethod => {
  if (!PAYMENT_METHODS.some((item) => item.value === value)) throw new ApiError(400, "El método de pago no es válido.");
  return value as PaymentMethod;
};

const readPayment = (method: unknown, wallet: unknown) => {
  const paymentMethod = readPaymentMethod(method);
  if (paymentMethod === "VIRTUAL_WALLET") {
    if (!WALLET_PROVIDERS.some((item) => item.value === wallet)) throw new ApiError(400, "Elegí la billetera virtual.");
    return { paymentMethod, walletProvider: wallet as WalletProvider };
  }
  if (wallet !== undefined && wallet !== null) throw new ApiError(400, "Solo las billeteras virtuales admiten proveedor.");
  return { paymentMethod, walletProvider: null };
};

const checkPermission = (permissions: readonly string[], permission: string) => {
  if (!permissions.includes(permission)) throw new ApiError(403, "No tenés permiso para realizar esta acción.");
};

type DatabaseErrorMessages = {
  notFound?: string;
  duplicate?: string;
  related?: string;
  internal?: string;
};

const sendApiError = (res: Response, error: unknown, messages: DatabaseErrorMessages = {}) => {
  if (error instanceof ApiError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : null;
  if (code === "P2025") {
    res.status(404).json({ message: messages.notFound ?? "Registro no encontrado en este comercio." });
  } else if (code === "P2002") {
    res.status(409).json({ message: messages.duplicate ?? "Uno de los valores únicos ya está registrado." });
  } else if (code === "P2003") {
    res.status(409).json({ message: messages.related ?? "La operación no puede completarse porque hay registros relacionados." });
  } else {
    console.error("No se pudo completar la operación. Código:", code ?? "desconocido");
    res.status(500).json({ message: messages.internal ?? "No se pudo completar la operación. Intentá nuevamente." });
  }
};

export {
  ApiError, readBody, readId, readNumber, readInteger, readText, readDate,
  readBoolean, readPaymentMethod, readPayment, checkPermission, sendApiError,
};
