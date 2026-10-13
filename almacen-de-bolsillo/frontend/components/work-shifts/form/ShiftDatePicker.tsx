import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View, useColorScheme } from "react-native";
import { CalendarBoard } from "../CalendarBoard";
import { formatCalendarDate, getMonthLabel } from "@/utils/work-shift-calendar";

export function ShiftDatePicker({ dates, multiple, disabled, onChange }: {
  dates: string[];
  multiple: boolean;
  disabled: boolean;
  onChange: (dates: string[]) => void;
}) {
  const [month, setMonth] = useState(() => {
    const initial = dates[0] ? new Date(`${dates[0]}T12:00:00`) : new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const isDark = useColorScheme() === "dark";
  function move(direction: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  }
  function select(day: Date) {
    const date = formatCalendarDate(day);
    onChange(multiple ? dates.includes(date) ? dates.filter((item) => item !== date) : [...dates, date].sort() : [date]);
    if (day.getMonth() !== month.getMonth() || day.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  }
  return (
    <View className="gap-3">
      <Text className="font-semibold text-gray-950 dark:text-white">{multiple ? "Fechas del turno" : "Fecha del turno"}</Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400">{multiple ? "Tocá los días que quieras asignar. Tocá de nuevo para quitar una fecha." : "Seleccioná la fecha de este turno."}</Text>
      <View className="flex-row items-center justify-between">
        <Pressable accessibilityRole="button" accessibilityLabel="Mes anterior" disabled={disabled} onPress={() => move(-1)} className="p-3"><Ionicons name="chevron-back" size={22} color={isDark ? "white" : "#111A1A"} /></Pressable>
        <Text className="font-semibold capitalize text-gray-950 dark:text-white">{getMonthLabel(month)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Mes siguiente" disabled={disabled} onPress={() => move(1)} className="p-3"><Ionicons name="chevron-forward" size={22} color={isDark ? "white" : "#111A1A"} /></Pressable>
      </View>
      <CalendarBoard month={month} selectedDates={dates} workShifts={[]} disabled={disabled} onSelectDate={select} />
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-gray-500 dark:text-gray-400">{dates.length} {dates.length === 1 ? "fecha seleccionada" : "fechas seleccionadas"}</Text>
        {multiple && dates.length > 0 && <Pressable accessibilityRole="button" disabled={disabled} onPress={() => onChange([])}><Text className="font-semibold text-blue-600 dark:text-blue-400">Limpiar</Text></Pressable>}
      </View>
      <View className="flex-row flex-wrap gap-2">
        {dates.map((date) => <Pressable key={date} accessibilityRole="button" accessibilityLabel={multiple ? `Quitar fecha ${date}` : `Fecha ${date}`} disabled={disabled || !multiple} onPress={() => onChange(dates.filter((item) => item !== date))} className="rounded-xl bg-[#111A1A] px-3 py-2"><Text className="text-sm text-white">{new Date(`${date}T12:00:00`).toLocaleDateString("es-AR")} {multiple ? "×" : ""}</Text></Pressable>)}
      </View>
    </View>
  );
}
