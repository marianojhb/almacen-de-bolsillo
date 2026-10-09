import { isValidCommerceLocation, isValidEmail, validateOwnerDetails, type RegisterCommerceDto } from "@almacen/shared";

export type RegisterCommerceFormValues = {
  name: string;
  commerceUsername: string;
  country: string;
  currency: string;
  timeZone: string;
  ownerFirstname: string;
  ownerLastname: string;
  ownerDni: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const usernamePattern = /^[a-z0-9][a-z0-9_-]{2,39}$/;

export function validateLoginForm(commerceUsername: string, username: string, password: string, mode: "commerce" | "user"): string | null {
  if (!usernamePattern.test(commerceUsername.trim().toLowerCase())) {
    return "Ingresá un usuario de comercio válido, de entre 3 y 40 caracteres.";
  }
  if (mode === "user" && (!username.trim() || username.trim().length > 254 || /\s/.test(username.trim()))) {
    return "Ingresá tu usuario personal sin espacios.";
  }
  if (!password || password.length > 128) return "Ingresá tu contraseña, de hasta 128 caracteres.";
  return null;
}

type RegisterValidation =
  | { ok: true; data: RegisterCommerceDto }
  | { ok: false; message: string };

export function validateRegisterForm(values: RegisterCommerceFormValues): RegisterValidation {
  const name = values.name.trim();
  const username = values.commerceUsername.trim().toLowerCase();
  const email = values.email.trim().toLowerCase();
  const country = values.country.trim().toUpperCase();
  const currency = values.currency.trim().toUpperCase();
  const timeZone = values.timeZone.trim();

  if (name.length < 2 || name.length > 100) return { ok: false, message: "El nombre del comercio debe tener entre 2 y 100 caracteres." };
  if (!usernamePattern.test(username)) {
    return { ok: false, message: "El usuario del comercio debe tener entre 3 y 40 caracteres, comenzar con una letra o un número y usar solo letras, números, guiones o guiones bajos." };
  }
  if (!isValidEmail(email)) return { ok: false, message: "Ingresá un correo válido para el dueño." };
  if (!isValidCommerceLocation(country, currency, timeZone)) return { ok: false, message: "Seleccioná un país, una moneda y una zona horaria de las opciones disponibles." };
  const ownerDetails = validateOwnerDetails({ firstname: values.ownerFirstname, lastname: values.ownerLastname, dni: values.ownerDni }, country);
  if (!ownerDetails.ok) return ownerDetails;
  if (values.password.length < 8 || values.password.length > 128) return { ok: false, message: "La contraseña debe tener entre 8 y 128 caracteres." };
  if (values.password !== values.confirmPassword) return { ok: false, message: "Las contraseñas no coinciden." };

  return {
    ok: true,
    data: {
      commerce: { name, username, country, currency, timeZone },
      owner: { ...ownerDetails.data, email, password: values.password },
    },
  };
}
