export type CommerceFormatSettings = { country: string; currency: string; timeZone: string };
type DateValue = string | Date | null;
type CurrencyOptions = Pick<Intl.NumberFormatOptions, "minimumFractionDigits" | "maximumFractionDigits">;

export const DEFAULT_COMMERCE_FORMAT: CommerceFormatSettings = {
  country: "AR", currency: "ARS", timeZone: "America/Argentina/Buenos_Aires",
};

const countryLocales: Record<string, string> = { AR: "es-AR", BR: "pt-BR", CL: "es-CL", ES: "es-ES", US: "en-US" };

const toDate = (value: string | Date) => value instanceof Date ? value : new Date(value);

const createDateKeyFormatter = (timeZone: string) => new Intl.DateTimeFormat("en-CA", {
  timeZone, year: "numeric", month: "2-digit", day: "2-digit",
});

const dateKeyFromFormatter = (date: Date, formatter: Intl.DateTimeFormat): string => {
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.year.padStart(4, "0")}-${parts.month}-${parts.day}`;
};

export function createCommerceFormat(settings: CommerceFormatSettings) {
  const locale = countryLocales[settings.country] ?? "es-AR";
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: settings.currency });
  const date = new Intl.DateTimeFormat(locale, { timeZone: settings.timeZone, day: "2-digit", month: "2-digit", year: "numeric" });
  const time = new Intl.DateTimeFormat(locale, { timeZone: settings.timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const dateTime = new Intl.DateTimeFormat(locale, {
    timeZone: settings.timeZone, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  const dateKey = createDateKeyFormatter(settings.timeZone);

  return {
    currency: settings.currency,
    timeZone: settings.timeZone,
    locale,
    formatCurrency: (value: number | string, options?: CurrencyOptions) => {
      const formatter = options ? new Intl.NumberFormat(locale, { ...options, style: "currency", currency: settings.currency }) : money;
      return formatter.format(Number(value));
    },
    formatDate: (value: DateValue, options?: Intl.DateTimeFormatOptions) => value === null ? "No informado"
      : (options ? new Intl.DateTimeFormat(locale, { ...options, timeZone: settings.timeZone }) : date).format(toDate(value)),
    formatTime: (value: DateValue) => value === null ? "No informado" : time.format(toDate(value)),
    formatDateTime: (value: DateValue) => value === null ? "No informado" : dateTime.format(toDate(value)),
    dateKey: (value: string | Date) => dateKeyFromFormatter(toDate(value), dateKey),
    // El nacimiento es una fecha de calendario: no se desplaza por la zona horaria.
    formatCalendarDate: (value: string | null, options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }) => value === null ? "No informado"
      : new Intl.DateTimeFormat("es-AR", { ...options, timeZone: "UTC" })
        .format(new Date(`${value.slice(0, 10)}T00:00:00.000Z`)),
  };
}

export function addCalendarDays(day: string, amount: number): string {
  const date = new Date(`${day}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function getCommerceDashboardPeriods(timeZone: string, now = new Date()) {
  const today = dateKeyFromFormatter(now, createDateKeyFormatter(timeZone));
  const weekday = new Date(`${today}T12:00:00.000Z`).getUTCDay();
  const weekStart = addCalendarDays(today, -((weekday + 6) % 7));
  const monthStart = `${today.slice(0, 7)}-01`;
  const firstChartDay = addCalendarDays(today, -6);
  const tomorrow = addCalendarDays(today, 1);
  return { today, tomorrow, weekStart, monthStart, firstChartDay,
    from: [weekStart, monthStart, firstChartDay].sort()[0], to: tomorrow };
}

export function getCommerceDayStart(day: string, timeZone: string): Date {
  const formatter = createDateKeyFormatter(timeZone);
  const midnightUtc = new Date(`${day}T00:00:00.000Z`).getTime();
  if (!Number.isFinite(midnightUtc)) throw new Error("La fecha del período no es válida.");
  let from = midnightUtc - 36 * 60 * 60 * 1000;
  let to = midnightUtc + 36 * 60 * 60 * 1000;
  // Buscar el inicio real del día, sin asumir que dura 24 horas ni un desplazamiento fijo.
  // También funciona si un cambio horario hace que el día empiece a la 01:00.
  while (from < to) {
    const middle = Math.floor((from + to) / 2);
    if (dateKeyFromFormatter(new Date(middle), formatter) < day) from = middle + 1;
    else to = middle;
  }
  const result = new Date(from);
  if (dateKeyFromFormatter(result, formatter) !== day) throw new Error("La fecha no existe en esta zona horaria.");
  return result;
}
