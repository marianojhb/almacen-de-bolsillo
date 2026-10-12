import type { WorkShift } from "@almacen/shared";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  shift: WorkShift;
};

export function WorkShiftCard({ shift }: Props) {
  const journey = shift.workShiftType;

  const employeeName =
    shift.employee.fullname ||
    [
      shift.employee.firstname,
      shift.employee.lastname,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Empleado";

  return (
    <View
      className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
      style={{
        borderLeftWidth: 5,
        borderLeftColor: journey.color,
      }}
    >
      <Text className="text-base font-semibold text-gray-950 dark:text-white">
        {employeeName}
      </Text>

      <View className="mt-2 flex-row items-center gap-2">
        <Ionicons
          name={
            journey.isNonWorkingDay
              ? "calendar-clear-outline"
              : "time-outline"
          }
          size={19}
          color={journey.color}
        />

        <Text className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
          {journey.name}
        </Text>
      </View>

      <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {journey.isNonWorkingDay
          ? "Jornada no laboral"
          : `${journey.startTime} a ${journey.endTime}`}
      </Text>

      {shift.notes && (
        <Text className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {shift.notes}
        </Text>
      )}
    </View>
  );
}