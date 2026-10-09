export function dateToLocalIso(date: Date): string {
  return [date.getFullYear().toString().padStart(4, "0"),
    (date.getMonth() + 1).toString().padStart(2, "0"), date.getDate().toString().padStart(2, "0")].join("-");
}

export function isValidBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    && value <= dateToLocalIso(new Date());
}

export function formatBirthDateDisplay(value: string): string {
  const iso = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function birthDateInputToIso(value: string): string | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;
  const [day, month, year] = value.split("/");
  const iso = `${year}-${month}-${day}`;
  return isValidBirthDate(iso) ? iso : null;
}

export function formatBirthDateInput(value: string, previous = ""): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return formatBirthDateDisplay(value);
  let digits = value.replace(/\D/g, "").slice(0, 8);
  // Si se borra la barra automática, también se borra el dígito anterior.
  if (previous.endsWith("/") && value === previous.slice(0, -1)) digits = digits.slice(0, -1);
  if (digits.length < 2) return digits;
  if (digits.length < 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
