import { Text, View } from "react-native";
import type { WorkShiftDto } from "@almacen/shared";
import { useCommerceFormat } from "@/hooks/use-commerce-format";
import { attendanceDetails } from "./work-shift-details.utils";
import { dateLabel } from "./work-shift-calendar.utils";

export function WorkShiftAttendance({ shift, now }: { shift: WorkShiftDto; now: number }) {
  const { formatTime, dateKey } = useCommerceFormat();
  const info = attendanceDetails(shift, now);
  const stamp = (value: string | null) => value
    ? `${formatTime(value)}${dateKey(value) !== dateKey(shift.startsAt) ? " · " + dateLabel(dateKey(value), { day: "numeric", month: "short" }) : ""}`
    : "—";
  return <View className="gap-2">
    <View className="flex-row gap-3">
      {[{ label: "Entrada registrada", value: shift.actualStartedAt }, { label: "Salida registrada", value: shift.actualEndedAt }].map((item) =>
        <View key={item.label} className="flex-1 gap-1 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
          <Text className="text-xs text-gray-500 dark:text-gray-400">{item.label}</Text>
          <Text className="text-lg font-semibold text-gray-950 dark:text-white">{stamp(item.value)}</Text>
        </View>)}
    </View>
    {shift.lateToleranceMinutes > 0 && <Text className="text-xs text-gray-500 dark:text-gray-400">Tolerancia de llegada: {shift.lateToleranceMinutes} min.</Text>}
    {info.lateMinutes > 0 && <Text className="text-sm font-semibold text-amber-700 dark:text-amber-300">Llegada tarde: {info.lateMinutes} min.</Text>}
    {info.earlyMinutes > 0 && <Text className="text-sm font-semibold text-amber-700 dark:text-amber-300">Salida anticipada: {info.earlyMinutes} min.</Text>}
    {info.missingExit && <Text className="text-sm text-amber-700 dark:text-amber-300">El horario previsto terminó y la salida sigue pendiente.</Text>}
  </View>;
}
