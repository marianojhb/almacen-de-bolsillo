export function formatCalendarDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCalendarDays(month: Date): Date[] {
  const firstDay = new Date(
    month.getFullYear(),
    month.getMonth(),
    1,
  );

  // El calendario comienza los lunes.
  const offset = (firstDay.getDay() + 6) % 7;

  return Array.from({ length: 42 }, (_, index) =>
    new Date(
      month.getFullYear(),
      month.getMonth(),
      1 - offset + index,
    ),
  );
}

export function getCalendarRange(month: Date) {
  const days = getCalendarDays(month);

  return {
    from: formatCalendarDate(days[0]!),
    to: formatCalendarDate(days[days.length - 1]!),
  };
}

export function getMonthLabel(month: Date): string {
  return month.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
}