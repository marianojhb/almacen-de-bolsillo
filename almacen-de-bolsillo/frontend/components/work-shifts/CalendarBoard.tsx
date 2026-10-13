import type { WorkShift } from "@almacen/shared";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import {
  formatCalendarDate,
  getCalendarDays,
} from "@/utils/work-shift-calendar";

type Props = {
  month: Date;
  selectedDate?: string;
  selectedDates?: readonly string[];
  disabled?: boolean;
  workShifts: WorkShift[];
  onSelectDate: (date: Date) => void;
};

const weekdays = [
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
  "Dom",
];

export function CalendarBoard({
  month,
  selectedDate,
  selectedDates,
  disabled = false,
  workShifts,
  onSelectDate,
}: Props) {
  const days = useMemo(
    () => getCalendarDays(month),
    [month],
  );

  const shiftsByDate = useMemo(() => {
    const groups = new Map<string, WorkShift[]>();

    for (const shift of workShifts) {
      const current = groups.get(shift.date) ?? [];
      current.push(shift);
      groups.set(shift.date, current);
    }

    return groups;
  }, [workShifts]);

  const today = formatCalendarDate(new Date());

  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
      <View className="flex-row">
        {weekdays.map((weekday) => (
          <View
            key={weekday}
            style={{ width: "14.285714%" }}
            className="items-center py-2"
          >
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {weekday}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day) => {
          const date = formatCalendarDate(day);
          const selected = selectedDates?.includes(date) ?? date === selectedDate;
          const isToday = date === today;

          const belongsToMonth =
            day.getMonth() === month.getMonth() &&
            day.getFullYear() === month.getFullYear();

          const shifts = shiftsByDate.get(date) ?? [];

          const colors = Array.from(
            new Set(
              shifts.map(
                (shift) => shift.workShiftType.color,
              ),
            ),
          ).slice(0, 3);

          return (
            <View
              key={date}
              style={{ width: "14.285714%" }}
              className="p-0.5"
            >
              <Pressable
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`${day.toLocaleDateString(
                  "es-AR",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}. ${shifts.length} turnos asignados.`}
                accessibilityState={{
                  selected,
                  disabled,
                }}
                onPress={() => onSelectDate(day)}
                className={`min-h-[56px] items-center justify-center rounded-xl border ${
                  selected
                    ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
                    : isToday
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                      : "border-transparent"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selected
                      ? "text-white dark:text-black"
                      : belongsToMonth
                        ? "text-gray-950 dark:text-white"
                        : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {day.getDate()}
                </Text>

                <View className="mt-1.5 h-2 flex-row items-center gap-1">
                  {colors.map((color) => (
                    <View
                      key={color}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
