import { isWorkShiftTime, validateWorkShiftBreaks, type WorkShiftBreakInput, type WorkShiftTimeBlock } from "@almacen/shared";
import { automaticBreakDays } from "../work-shift-calendar.utils.ts";

const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const clock = (minute: number) => `${String(Math.floor(minute / 60) % 24).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

export function breakValidationMessage(block: WorkShiftTimeBlock, breaks: WorkShiftBreakInput[]) {
  try { validateWorkShiftBreaks(block, automaticBreakDays(block, breaks)); return null; }
  catch (error) { return error instanceof Error ? error.message : "Revisá los descansos."; }
}

export function breakTimeChoices(block: WorkShiftTimeBlock, breaks: WorkShiftBreakInput[], index: number, field: "startTime" | "endTime") {
  const current = breaks[index];
  if (current?.mode !== "FIXED" || !isWorkShiftTime(block.startTime) || !isWorkShiftTime(block.endTime)) return [];
  const choices: string[] = [];
  for (let minute = 0; minute < 1440; minute++) {
    const time = clock(minute);
    const next = breaks.map((item, position) => position === index ? { ...current, [field]: time } : item);
    if (!breakValidationMessage(block, next)) choices.push(time);
  }
  return choices;
}

export function newBreakForShift(block: WorkShiftTimeBlock, breaks: WorkShiftBreakInput[], mode: "FIXED" | "FLEXIBLE"): WorkShiftBreakInput | null {
  if (breakValidationMessage(block, breaks)) return null;
  const start = minutes(block.startTime);
  const end = minutes(block.endTime) + (block.endsNextDay ? 1440 : 0);
  const normalized = automaticBreakDays(block, breaks);
  const used = normalized.reduce((sum, item) => sum + (item.mode === "FLEXIBLE" ? item.durationMinutes
    : minutes(item.endTime) + (item.endsNextDay ? 1440 : 0) - minutes(item.startTime) - (item.startsNextDay ? 1440 : 0)), 0);
  const duration = Math.min(30, end - start - used - 1);
  if (duration < 1) return null;
  if (mode === "FLEXIBLE") return { mode, durationMinutes: duration };
  for (let minute = start; minute + duration <= end; minute++) {
    const item: WorkShiftBreakInput = { mode, startTime: clock(minute), endTime: clock(minute + duration) };
    if (!breakValidationMessage(block, [...breaks, item])) return item;
  }
  return null;
}
