import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Modal, Platform, Pressable, Text, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dateToLocalIso, isWorkShiftDate, isWorkShiftTime } from "@almacen/shared";
import { AuthButton } from "@/components/auth/AuthButton";
import { WorkShiftDialog } from "../WorkShiftDialog";
import { dateLabel } from "../work-shift-calendar.utils";

export type CalendarFieldProps = {
  label: string; mode: "date" | "time"; value: string; onChange: (value: string) => void;
  disabled?: boolean; showLabel?: boolean; allowedTimes?: string[];
};
const allTimes = Array.from({ length: 1440 }, (_, minute) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`);

export function CalendarField({ label, mode, value, onChange, disabled = false, showLabel = true, allowedTimes }: CalendarFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(new Date());
  const [time, setTime] = useState("08:00");
  const isDark = useColorScheme() === "dark";
  const times = allowedTimes ?? allTimes;
  const hours = [...new Set(times.map((item) => item.slice(0, 2)))];
  const minutes = times.filter((item) => item.slice(0, 2) === time.slice(0, 2)).map((item) => item.slice(3));
  const show = () => {
    if (mode === "time") {
      setTime(times.includes(value) ? value : times[0] ?? "08:00");
      setOpen(true);
      return;
    }
    const initial = isWorkShiftDate(value) ? new Date(`${value}T12:00:00`) : new Date();
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({ value: initial, mode: "date",
        onValueChange: (_event, date) => { if (date) onChange(dateToLocalIso(date)); } });
    } else { setDraft(initial); setOpen(true); }
  };
  const pickerColor = isDark ? "#FFFFFF" : "#111827";
  return <View className="gap-2">
    {showLabel && <Text className="font-semibold text-gray-950 dark:text-white">{label}</Text>}
    <Pressable disabled={disabled || (mode === "time" && !times.length)} onPress={show}
      accessibilityRole="button" accessibilityLabel={`${label}: ${value}`}
      className="min-h-12 flex-row items-center justify-between gap-2 rounded-xl border border-gray-300 bg-white px-3 py-3 dark:border-gray-700 dark:bg-gray-900">
      <Text className="flex-1 text-base text-gray-950 dark:text-white">{mode === "date" && isWorkShiftDate(value) ? dateLabel(value) : value || "Seleccionar"}</Text>
      <Ionicons name={mode === "date" ? "calendar-outline" : "time-outline"} size={22} color="#9ca3af" />
    </Pressable>
    {mode === "time" ? <WorkShiftDialog visible={open} title={label} onClose={() => setOpen(false)}>
      <Text className="text-center text-3xl font-bold text-gray-950 dark:text-white">{time}</Text>
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <Text className="text-center text-xs text-gray-500 dark:text-gray-400">Hora</Text>
          <Picker selectedValue={time.slice(0, 2)} style={{ color: pickerColor }} itemStyle={{ color: pickerColor }} accessibilityLabel="Hora, formato de 24 horas"
            onValueChange={(hour) => {
              const sameMinute = `${hour}:${time.slice(3)}`;
              setTime(times.includes(sameMinute) ? sameMinute : times.find((item) => item.startsWith(String(hour) + ":")) ?? time);
            }}>
            {hours.map((hour) => <Picker.Item key={hour} label={hour} value={hour} />)}
          </Picker>
        </View>
        <Text className="text-2xl text-gray-950 dark:text-white">:</Text>
        <View className="flex-1">
          <Text className="text-center text-xs text-gray-500 dark:text-gray-400">Minutos</Text>
          <Picker selectedValue={time.slice(3)} style={{ color: pickerColor }} itemStyle={{ color: pickerColor }} accessibilityLabel="Minutos"
            onValueChange={(minute) => setTime(`${time.slice(0, 2)}:${minute}`)}>
            {minutes.map((minute) => <Picker.Item key={minute} label={minute} value={minute} />)}
          </Picker>
        </View>
      </View>
      <AuthButton label="Confirmar" disabled={!isWorkShiftTime(time) || !times.includes(time)}
        onPress={() => { onChange(time); setOpen(false); }} />
      <AuthButton label="Cancelar" secondary onPress={() => setOpen(false)} />
    </WorkShiftDialog> : <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
      <SafeAreaView className="flex-1 gap-5 bg-gray-50 p-4 dark:bg-black">
        <Text className="text-xl font-bold text-gray-950 dark:text-white">{label}</Text>
        <DateTimePicker value={draft} mode="date" display="inline" locale="es-AR"
          themeVariant={isDark ? "dark" : "light"} style={{ height: 370 }}
          onValueChange={(_event, date) => { if (date) setDraft(date); }} />
        <AuthButton label="Confirmar" onPress={() => { onChange(dateToLocalIso(draft)); setOpen(false); }} />
        <AuthButton label="Cancelar" secondary onPress={() => setOpen(false)} />
      </SafeAreaView>
    </Modal>}
  </View>;
}
