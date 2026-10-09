export type CommerceCountryOption = {
  code: string;
  name: string;
  currency: string;
  timeZones: { value: string; label: string }[];
};

export const COMMERCE_COUNTRIES: CommerceCountryOption[] = [
  { code: "AR", name: "Argentina", currency: "ARS", timeZones: [
    { value: "America/Argentina/Buenos_Aires", label: "Argentina — Buenos Aires" },
  ] },
  { code: "BR", name: "Brasil", currency: "BRL", timeZones: [
    { value: "America/Sao_Paulo", label: "Brasilia / São Paulo" },
    { value: "America/Manaus", label: "Manaus" },
    { value: "America/Cuiaba", label: "Cuiabá" },
    { value: "America/Campo_Grande", label: "Campo Grande" },
    { value: "America/Rio_Branco", label: "Rio Branco" },
    { value: "America/Noronha", label: "Fernando de Noronha" },
  ] },
  { code: "CL", name: "Chile", currency: "CLP", timeZones: [
    { value: "America/Santiago", label: "Santiago" },
    { value: "America/Coyhaique", label: "Aysén — Coyhaique" },
    { value: "America/Punta_Arenas", label: "Magallanes — Punta Arenas" },
    { value: "Pacific/Easter", label: "Isla de Pascua" },
  ] },
  { code: "ES", name: "España", currency: "EUR", timeZones: [
    { value: "Europe/Madrid", label: "Península / Baleares" },
    { value: "Atlantic/Canary", label: "Canarias" },
    { value: "Africa/Ceuta", label: "Ceuta / Melilla" },
  ] },
  { code: "US", name: "Estados Unidos", currency: "USD", timeZones: [
    { value: "America/New_York", label: "Este — Nueva York" },
    { value: "America/Chicago", label: "Centro — Chicago" },
    { value: "America/Denver", label: "Montaña — Denver" },
    { value: "America/Phoenix", label: "Arizona — Phoenix" },
    { value: "America/Los_Angeles", label: "Pacífico — Los Ángeles" },
    { value: "America/Anchorage", label: "Alaska — Anchorage" },
    { value: "America/Adak", label: "Aleutianas — Adak" },
    { value: "Pacific/Honolulu", label: "Hawái — Honolulu" },
  ] },
];

export const COMMERCE_CURRENCIES = [
  { value: "ARS", label: "ARS · $ · Peso argentino" },
  { value: "BRL", label: "BRL · R$ · Real brasileño" },
  { value: "CLP", label: "CLP · $ · Peso chileno" },
  { value: "EUR", label: "EUR · € · Euro" },
  { value: "USD", label: "USD · US$ · Dólar estadounidense" },
];

export function getCommerceCountry(code: string) {
  return COMMERCE_COUNTRIES.find((country) => country.code === code);
}

export function isValidCommerceLocation(country: string, currency: string, timeZone: string): boolean {
  return !!getCommerceCountry(country)?.timeZones.some((zone) => zone.value === timeZone)
    && COMMERCE_CURRENCIES.some((option) => option.value === currency);
}
