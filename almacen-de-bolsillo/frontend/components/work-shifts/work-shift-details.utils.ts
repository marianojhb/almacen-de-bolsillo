import { getWorkShiftLateMinutes, addCalendarDays, getCommerceDayStart, getNonWorkingDayInterval, getWorkShiftLocalFields,
  type EmployeeNonWorkingDayDto, type WorkShiftAssignmentDraft, type WorkShiftCalendarDto, type WorkShiftDto } from "@almacen/shared";
import { calendarDays, dateLabel, type CalendarView } from "./work-shift-calendar.utils.ts";

export function groupAssignmentPreview(drafts: WorkShiftAssignmentDraft[]) {
  const days = new Map<string, { draft: WorkShiftAssignmentDraft; index: number }[]>();
  drafts.forEach((draft, index) => {
    if (!days.has(draft.date)) days.set(draft.date, []);
    days.get(draft.date)!.push({ draft, index });
  });
  return [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, entries]) => ({
    date, entries: entries.sort((a, b) => (a.draft.startsAt ?? "").localeCompare(b.draft.startsAt ?? "")),
  }));
}

export function trackingPeriod(anchor: string, view: CalendarView) {
  const dates = calendarDays(anchor, view).filter((day) => view === "week" || day.slice(0, 7) === anchor.slice(0, 7));
  const from = dates[0]!;
  const to = dates[dates.length - 1]!;
  return { from, to, dates, title: view === "month"
    ? dateLabel(anchor, { month: "long", year: "numeric" })
    : `${dateLabel(from, { day: "numeric", month: "short" })} – ${dateLabel(to, { day: "numeric", month: "short", year: "numeric" })}` };
}

export function shiftTimeRange(startsAt: string, endsAt: string, timeZone: string) {
  const start = getWorkShiftLocalFields(startsAt, timeZone);
  const end = getWorkShiftLocalFields(endsAt, timeZone);
  return `${start.time}–${end.time}${start.date !== end.date ? " · termina " + dateLabel(end.date, { day: "numeric", month: "short" }) : ""}`;
}

export function attendanceDetails(shift: WorkShiftDto, now: number) {
  const lateMinutes = getWorkShiftLateMinutes(shift);
  const earlyMinutes = shift.actualEndedAt ? Math.max(0, Math.ceil((Date.parse(shift.endsAt) - Date.parse(shift.actualEndedAt)) / 60000)) : 0;
  return { lateMinutes, earlyMinutes,
    missingEntry: shift.status !== "CANCELLED" && !shift.actualStartedAt && now >= Date.parse(shift.endsAt),
    missingExit: shift.status !== "CANCELLED" && !!shift.actualStartedAt && !shift.actualEndedAt && now >= Date.parse(shift.endsAt),
  };
}

export function summarizeTracking(calendar: WorkShiftCalendarDto, anchor: string, view: CalendarView, timeZone: string, now: number) {
  const period = trackingPeriod(anchor, view);
  const from = getCommerceDayStart(period.from, timeZone).getTime();
  const to = getCommerceDayStart(addCalendarDays(period.to, 1), timeZone).getTime();
  const overlapMinutes = (start: string, end: string) => Math.max(0, Math.min(Date.parse(end), to) - Math.max(Date.parse(start), from)) / 60000;
  const shifts = calendar.shifts.filter((shift) => shift.status !== "CANCELLED" && overlapMinutes(shift.startsAt, shift.endsAt) > 0);
  const plannedMinutes = shifts.reduce((sum, shift) => sum + overlapMinutes(shift.startsAt, shift.endsAt), 0);
  const recordedMinutes = shifts.reduce((sum, shift) => sum + (shift.actualStartedAt && shift.actualEndedAt
    ? overlapMinutes(shift.actualStartedAt, shift.actualEndedAt) : 0), 0);
  return { period, shifts, plannedMinutes, recordedMinutes,
    completed: shifts.filter((shift) => shift.status === "COMPLETED").length,
    missingEntries: shifts.filter((shift) => attendanceDetails(shift, now).missingEntry).length,
    late: shifts.filter((shift) => attendanceDetails(shift, now).lateMinutes > 0).length,
    early: shifts.filter((shift) => attendanceDetails(shift, now).earlyMinutes > 0).length,
  };
}

export function groupTrackingHistory(calendar: WorkShiftCalendarDto, anchor: string, view: CalendarView, timeZone: string) {
  const period = trackingPeriod(anchor, view);
  const from = getCommerceDayStart(period.from, timeZone).getTime();
  const to = getCommerceDayStart(addCalendarDays(period.to, 1), timeZone).getTime();
  const days = new Map<string, { date: string; shifts: WorkShiftDto[]; nonWorkingDays: EmployeeNonWorkingDayDto[] }>();
  const getDay = (date: string) => {
    if (!days.has(date)) days.set(date, { date, shifts: [], nonWorkingDays: [] });
    return days.get(date)!;
  };
  for (const shift of calendar.shifts) {
    if (Date.parse(shift.startsAt) < to && Date.parse(shift.endsAt) > from) {
      getDay(getWorkShiftLocalFields(shift.startsAt, timeZone).date).shifts.push(shift);
    }
  }
  for (const item of calendar.nonWorkingDays) {
    const interval = getNonWorkingDayInterval(item, timeZone);
    if (interval.startsAt.getTime() < to && interval.endsAt.getTime() > from) getDay(item.date).nonWorkingDays.push(item);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date)).map((day) => ({
    ...day, shifts: day.shifts.sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  }));
}
