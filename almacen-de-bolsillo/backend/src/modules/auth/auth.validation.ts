import { isValidCommerceLocation, isValidEmail, validateOwnerDetails, type LoginDto, type RegisterCommerceDto } from "@almacen/shared";

type ValidationResult = { ok: true; data: RegisterCommerceDto } | { ok: false; message: string };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

const validateRegisterCommerce = (body: unknown): ValidationResult => {
  if (!isRecord(body) || !isRecord(body.commerce) || !isRecord(body.owner)) {
    return { ok: false, message: "Los datos del comercio y del dueño son obligatorios." };
  }

  const commerce = body.commerce;
  const owner = body.owner;

  if (typeof commerce.name !== "string") {
    return { ok: false, message: "El nombre del comercio es obligatorio." };
  }

  const name = commerce.name.trim();

  if (name.length < 2 || name.length > 100) {
    return { ok: false, message: "El nombre del comercio debe tener entre 2 y 100 caracteres." };
  }

  if (typeof commerce.username !== "string") {
    return { ok: false, message: "El nombre de usuario del comercio es obligatorio." };
  }

  const username = commerce.username.trim().toLowerCase();

  if (!/^[a-z0-9][a-z0-9_-]{2,39}$/.test(username)) {
    return {
      ok: false,
      message: "El usuario del comercio debe tener entre 3 y 40 caracteres, comenzar con una letra o un número y usar solo letras, números, guiones o guiones bajos.",
    };
  }

  if (typeof commerce.country !== "string" || !/^[a-zA-Z]{2}$/.test(commerce.country.trim())) {
    return { ok: false, message: "El país debe indicarse con un código de dos letras, por ejemplo AR." };
  }

  const country = commerce.country.trim().toUpperCase();

  if (typeof commerce.currency !== "string") {
    return { ok: false, message: "La moneda es obligatoria." };
  }

  const currency = commerce.currency.trim().toUpperCase();
  if (!Intl.supportedValuesOf("currency").includes(currency)) {
    return { ok: false, message: "La moneda no es válida. Usá un código como ARS o USD." };
  }

  if (typeof commerce.timeZone !== "string" || !commerce.timeZone.trim() || commerce.timeZone.length > 100) {
    return { ok: false, message: "La zona horaria es obligatoria." };
  }
  const timeZone = commerce.timeZone.trim();

  try {
    new Intl.DateTimeFormat("es", { timeZone }).format();
  } catch {
    return { ok: false, message: "La zona horaria no es válida." };
  }

  if (!isValidCommerceLocation(country, currency, timeZone)) {
    return { ok: false, message: "Seleccioná un país, una moneda y una zona horaria de las opciones disponibles." };
  }

  const ownerDetails = validateOwnerDetails(owner, country);

  if (!ownerDetails.ok) return ownerDetails;

  if (typeof owner.email !== "string") {
    return { ok: false, message: "El correo del dueño es obligatorio." };
  }

  const email = owner.email.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return { ok: false, message: "El correo del dueño no es válido." };
  }

  if (typeof owner.password !== "string" || owner.password.length < 8 || owner.password.length > 128) {
    return { ok: false, message: "La contraseña debe tener entre 8 y 128 caracteres." };
  }

  return {
    ok: true,
    data: {
      commerce: { name, username, country, currency, timeZone },
      owner: { ...ownerDetails.data, email, password: owner.password },
    },
  };
};

type LoginValidationResult = { ok: true; data: LoginDto } | { ok: false; message: string };

const validateLogin = (body: unknown): LoginValidationResult => {
  if (!isRecord(body)) {
    return { ok: false, message: "Los datos de inicio de sesión no son válidos." };
  }

  if (body.mode !== "commerce" && body.mode !== "user") {
    return { ok: false, message: "Seleccioná Comercio o Usuario para iniciar sesión." };
  }

  if (typeof body.commerceUsername !== "string") {
    return { ok: false, message: "El usuario del comercio es obligatorio." };
  }
  const commerceUsername = body.commerceUsername.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{2,39}$/.test(commerceUsername)) {
    return { ok: false, message: "El usuario del comercio no es válido." };
  }

  if (typeof body.password !== "string" || body.password.length === 0 || body.password.length > 128) {
    return { ok: false, message: "Ingresá una contraseña de hasta 128 caracteres." };
  }

  if (body.mode === "commerce") {
    return {
      ok: true,
      data: { mode: "commerce", commerceUsername, password: body.password },
    };
  }

  if (typeof body.username !== "string") {
    return { ok: false, message: "El usuario personal es obligatorio." };
  }
  const username = body.username.trim().toLowerCase();
  
  if (!username || username.length > 254 || /\s/.test(username)) {
    return { ok: false, message: "El usuario personal no es válido." };
  }

  return {
    ok: true,
    data: { mode: "user", commerceUsername, username, password: body.password },
  };
};

export { validateRegisterCommerce, validateLogin };
