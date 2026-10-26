import { Ionicons } from "@expo/vector-icons";
import type { WorkShift } from "@almacen/shared";
import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";

import { useWorkShifts } from "@/contexts/work-shifts";
import { usePermissions } from "@/hooks/usePermissions";
import { NotebookHeading } from "@/components/ui/notebook";

import {
  formatCalendarDate,
  getMonthLabel,
} from "@/utils/work-shift-calendar";

import { CalendarBoard } from "./CalendarBoard";
import { WorkShiftCard } from "./WorkShiftCard";

type Section = "calendar" | "tracking" | "journeys";

function formatDateLabel(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    "es-AR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  );
}

export function WorkShiftsScreen() {
  const {
    month,
    workShifts,
    workShiftTypes,
    isLoading,
    error,
    previousMonth,
    nextMonth,
    currentMonth,
    refresh,
    deleteWorkShift,
    deactivateWorkShiftType,
  } = useWorkShifts();

  const { can } = usePermissions();

  const isDark = useColorScheme() === "dark";

  const [section, setSection] =
    useState<Section>("calendar");
  const [confirmation, setConfirmation] = useState<{ id: number; kind: "shift" | "journey" } | null>(null);
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  async function confirmRemoval() {
    if (!confirmation || saving) return;
    setSaving(true);
    setMutationError(null);
    try {
      if (confirmation.kind === "shift") await deleteWorkShift(confirmation.id);
      else await deactivateWorkShiftType(confirmation.id);
      setConfirmation(null);
    } catch (failure) {
      setMutationError(failure instanceof Error ? failure.message : "No se pudo completar la operación.");
    } finally {
      setSaving(false);
    }
  }

  function renderShift(shift: WorkShift) {
    return (
      <View key={shift.id} className="gap-2">
        <WorkShiftCard shift={shift} />
        <View className="flex-row justify-end gap-4">
          {can("workShifts", "update") && <Pressable accessibilityRole="button" disabled={saving} onPress={() => router.push(`/more/work-shifts/shift?id=${shift.id}` as Href)}><Text className="font-semibold text-blue-600 dark:text-blue-400">Editar turno</Text></Pressable>}
          {can("workShifts", "delete") && <Pressable accessibilityRole="button" disabled={saving} onPress={() => { setMutationError(null); setConfirmation({ id: shift.id, kind: "shift" }); }}><Text className="font-semibold text-red-600 dark:text-red-400">Eliminar</Text></Pressable>}
        </View>
      </View>
    );
  }

  const [selectedDate, setSelectedDate] = useState(
    () => formatCalendarDate(new Date()),
  );

  const canReadTypes = can("workShiftTypes", "read");

  const monthPrefix = formatCalendarDate(month).slice(
    0,
    7,
  );

  const visibleSelectedDate = selectedDate.startsWith(
    monthPrefix,
  )
    ? selectedDate
    : formatCalendarDate(month);

  const selectedShifts = useMemo(
    () =>
      workShifts.filter(
        (shift) => shift.date === visibleSelectedDate,
      ),
    [workShifts, visibleSelectedDate],
  );

  const monthShifts = useMemo(
    () =>
      workShifts.filter(
        (shift) => shift.date.startsWith(monthPrefix),
      ),
    [workShifts, monthPrefix],
  );

  const trackingDays = useMemo(
    () =>
      Array.from(
        new Set(monthShifts.map((shift) => shift.date)),
      ).sort(),
    [monthShifts],
  );

  const sections: {
    id: Section;
    label: string;
  }[] = [
    {
      id: "calendar",
      label: "Calendario",
    },
    {
      id: "tracking",
      label: "Seguimiento",
    },
    ...(canReadTypes
      ? [
          {
            id: "journeys" as const,
            label: "Jornadas",
          },
        ]
      : []),
  ];

  function changeMonth(direction: -1 | 1) {
    const target = new Date(
      month.getFullYear(),
      month.getMonth() + direction,
      1,
    );

    setSelectedDate(formatCalendarDate(target));

    if (direction === -1) {
      previousMonth();
    } else {
      nextMonth();
    }
  }

  function selectDay(day: Date) {
    setSelectedDate(formatCalendarDate(day));

    const firstDay = new Date(
      month.getFullYear(),
      month.getMonth(),
      1,
    );

    const nextMonthStart = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      1,
    );

    if (day < firstDay) {
      previousMonth();
    } else if (day >= nextMonthStart) {
      nextMonth();
    }
  }

  function goToToday() {
    setSelectedDate(formatCalendarDate(new Date()));
    currentMonth();
  }

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerClassName="gap-4 p-4 pb-8"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => {
            void refresh();
          }}
        />
      }
    >
      <NotebookHeading subtitle="Calendario y jornadas asignadas">Turnos laborales</NotebookHeading>

      <View className="flex-row gap-2">
        {sections.map((item) => {
          const selected = item.id === section;

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{
                selected,
              }}
              onPress={() => setSection(item.id)}
              className={`flex-1 items-center rounded-xl border px-2 py-3 ${
                selected
                  ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selected
                    ? "text-white dark:text-black"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {can(section === "journeys" ? "workShiftTypes" : "workShifts", "create") && (
        <Pressable accessibilityRole="button" disabled={isLoading || saving} onPress={() => router.push((section === "journeys" ? "/more/work-shifts/type" : `/more/work-shifts/shift?date=${visibleSelectedDate}`) as Href)} className="items-center rounded-xl bg-[#111A1A] p-4">
          <Text className="font-semibold text-white">{section === "journeys" ? "+ Crear jornada" : "+ Asignar turno"}</Text>
        </Pressable>
      )}

      {section !== "journeys" && (
        <View className="flex-row items-center justify-between gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mes anterior"
            disabled={isLoading}
            onPress={() => changeMonth(-1)}
            className="h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={isDark ? "#ffffff" : "#111111"}
            />
          </Pressable>

          <Text className="flex-1 text-center text-base font-semibold capitalize text-gray-950 dark:text-white">
            {getMonthLabel(month)}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={goToToday}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          >
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Hoy
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mes siguiente"
            disabled={isLoading}
            onPress={() => changeMonth(1)}
            className="h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "#ffffff" : "#111111"}
            />
          </Pressable>
        </View>
      )}

      {error && (
        <View className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <Text className="text-sm text-red-700 dark:text-red-300">
            {error}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void refresh();
            }}
            className="mt-3"
          >
            <Text className="font-semibold text-red-700 dark:text-red-300">
              Reintentar
            </Text>
          </Pressable>
        </View>
      )}

      {isLoading && (
        <ActivityIndicator
          color={isDark ? "#ffffff" : "#111A1A"}
        />
      )}

      {section === "calendar" && (
        <>
          <CalendarBoard
            month={month}
            selectedDate={visibleSelectedDate}
            workShifts={workShifts}
            onSelectDate={selectDay}
          />

          <Text className="text-lg font-semibold capitalize text-gray-950 dark:text-white">
            {formatDateLabel(visibleSelectedDate)}
          </Text>

          {!isLoading &&
            !error &&
            selectedShifts.length === 0 && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                No hay turnos asignados para este día.
              </Text>
            )}

          {selectedShifts.map(renderShift)}
        </>
      )}

      {section === "tracking" && (
        <>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {monthShifts.length} turnos asignados en el mes
          </Text>

          {!isLoading &&
            !error &&
            trackingDays.length === 0 && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                No hay turnos asignados en este mes.
              </Text>
            )}

          {trackingDays.map((date) => (
            <View key={date} className="gap-3">
              <Text className="mt-2 text-base font-semibold capitalize text-gray-950 dark:text-white">
                {formatDateLabel(date)}
              </Text>

              {monthShifts
                .filter((shift) => shift.date === date)
                .map(renderShift)}
            </View>
          ))}
        </>
      )}

      {section === "journeys" && canReadTypes && (
        <>
          {!isLoading &&
            !error &&
            workShiftTypes.length === 0 && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Todavía no hay jornadas creadas.
              </Text>
            )}

          {workShiftTypes.map((journey) => (
            <View
              key={journey.id}
              className={`rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 ${
                journey.isActive ? "" : "opacity-50"
              }`}
              style={{
                borderLeftWidth: 5,
                borderLeftColor: journey.color,
              }}
            >
              <View className="flex-row items-center justify-between gap-3">
                <Text className="flex-1 text-base font-semibold text-gray-950 dark:text-white">
                  {journey.name}
                </Text>

                {!journey.isActive && (
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Desactivada
                  </Text>
                )}
              </View>

              <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {journey.isNonWorkingDay
                  ? "Jornada no laboral"
                  : `${journey.startTime} a ${journey.endTime}`}
              </Text>
              <View className="mt-4 flex-row justify-end gap-4">
                {can("workShiftTypes", "update") && <Pressable accessibilityRole="button" disabled={saving} onPress={() => router.push(`/more/work-shifts/type?id=${journey.id}` as Href)}><Text className="font-semibold text-blue-600 dark:text-blue-400">Editar jornada</Text></Pressable>}
                {journey.isActive && can("workShiftTypes", "delete") && <Pressable accessibilityRole="button" disabled={saving} onPress={() => { setMutationError(null); setConfirmation({ id: journey.id, kind: "journey" }); }}><Text className="font-semibold text-red-600 dark:text-red-400">Desactivar</Text></Pressable>}
              </View>
            </View>
          ))}
        </>
      )}
      <Modal visible={confirmation !== null} transparent animationType="fade" onRequestClose={() => { if (!saving) setConfirmation(null); }}>
        <View className="flex-1 items-center justify-center bg-black/50 p-6">
          <View className="w-full max-w-md gap-4 rounded-2xl bg-white p-5 dark:bg-gray-900">
            <Text className="text-lg font-bold text-gray-950 dark:text-white">{confirmation?.kind === "shift" ? "¿Eliminar este turno?" : "¿Desactivar esta jornada?"}</Text>
            <Text className="text-gray-600 dark:text-gray-300">{confirmation?.kind === "shift" ? "Se quitará del calendario del empleado." : "Los turnos existentes se conservan. La jornada dejará de estar disponible para nuevos turnos."}</Text>
            {mutationError && <Text className="text-red-600 dark:text-red-400">{mutationError}</Text>}
            <View className="flex-row justify-end gap-5">
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => setConfirmation(null)}><Text className="font-semibold text-gray-700 dark:text-gray-200">Cancelar</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => void confirmRemoval()}><Text className="font-semibold text-red-600 dark:text-red-400">{saving ? "Guardando…" : "Confirmar"}</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
