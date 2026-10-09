export const PHONE_COUNTRIES = [
  { country: "AR", value: "+54", label: "Argentina (+54)" },
  { country: "BR", value: "+55", label: "Brasil (+55)" },
  { country: "CL", value: "+56", label: "Chile (+56)" },
  { country: "ES", value: "+34", label: "España (+34)" },
  { country: "US", value: "+1", label: "Estados Unidos (+1)" },
];

export function normalizePhoneContact(countryCode: unknown, phone: unknown) {
  if (phone !== null && typeof phone !== "string") throw new Error("El teléfono debe ser texto.");
  if (countryCode !== null && typeof countryCode !== "string") throw new Error("El código de país debe ser texto.");
  const number = phone?.trim() ?? "";
  if (!number) return { phoneCountryCode: null, phone: null };
  if (!PHONE_COUNTRIES.some((country) => country.value === countryCode)) throw new Error("Elegí el código de país del teléfono.");
  if (!/^\d{6,14}$/.test(number) || number.length + String(countryCode).length - 1 > 15) {
    throw new Error("Ingresá el número nacional con código de área, solo dígitos y sin prefijo internacional.");
  }
  return { phoneCountryCode: countryCode as string, phone: number };
}

export const formatPhoneContact = (code: string | null, phone: string | null) => phone ? [code, phone].filter(Boolean).join(" ") : "";
