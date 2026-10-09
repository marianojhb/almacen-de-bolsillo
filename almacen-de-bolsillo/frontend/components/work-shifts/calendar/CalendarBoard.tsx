import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useWorkShifts } from "@/contexts/work-shifts";
import { useCommerceFormat } from "@/hooks/use-commerce-format";
import { CalendarField } from "../form/CalendarField";
import { JourneyIcon } from "../JourneyIcon";
import { calendarCells, calendarDays, dateLabel, groupCalendarEntries, moveCalendar, shiftStatus, WEEKDAYS, type CalendarView } from "../work-shift-calendar.utils";

export function CalendarBoard() {
  const { calendar, timeZone, now, today, view, setView, anchor, navigateDate, selectedDay, setSelectedDay,
    editing, selectedType, pendingAssignments, toggleDayAssignment, draftSelection, assignmentBusy, loading, dayDetailsOpen, setDayDetailsOpen } = useWorkShifts();
  const { formatTime } = useCommerceFormat();
  const days = calendarDays(anchor, view);
  const cells = calendarCells(anchor, view);
  const grouped = useMemo(() => groupCalendarEntries(calendarDays(anchor, view), calendar, draftSelection.drafts, timeZone),
    [anchor, view, calendar, draftSelection.drafts, timeZone]);
  const rows = Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, (index + 1) * 7));
  const title = view === "month" ? dateLabel(anchor, { month: "long", year: "numeric" })
    : `${dateLabel(days[0], { day: "numeric", month: "short" })} – ${dateLabel(days[days.length - 1], { day: "numeric", month: "short", year: "numeric" })}`;

  return <View className="gap-4">
    <View className="flex-row rounded-full bg-gray-200 p-1 dark:bg-gray-800">
      {([{ value: "month", label: "Mes" }, { value: "week", label: "Semana" }] as { value: CalendarView; label: string }[]).map((option) => (
        <Pressable key={option.value} disabled={assignmentBusy} accessibilityRole="radio" accessibilityState={{ checked: view === option.value }}
          onPress={() => setView(option.value)} className={`min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full ${view === option.value ? "bg-emerald-600" : ""}`}>
          <Ionicons name={option.value === "month" ? "calendar-outline" : "today-outline"} size={18} color={view === option.value ? "#FFFFFF" : "#64748B"} />
          <Text className={`font-semibold ${view === option.value ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
    <View className="flex-row items-center gap-2">
      <Pressable disabled={assignmentBusy} accessibilityRole="button" accessibilityLabel="Período anterior" onPress={() => navigateDate(moveCalendar(anchor, view, -1))} className="h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-gray-900">
        <Ionicons name="chevron-back" size={22} color="#059669" />
      </Pressable>
      <Text className="flex-1 text-center text-lg font-bold capitalize text-gray-950 dark:text-white">{title}</Text>
      <Pressable disabled={assignmentBusy} accessibilityRole="button" accessibilityLabel="Período siguiente" onPress={() => navigateDate(moveCalendar(anchor, view, 1))} className="h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-gray-900">
        <Ionicons name="chevron-forward" size={22} color="#059669" />
      </Pressable>
    </View>
    <View className="flex-row items-end gap-3">
      <View className="flex-1"><CalendarField label="Elegir fecha del calendario" showLabel={false} mode="date" value={anchor} onChange={navigateDate} disabled={assignmentBusy} /></View>
      <Pressable disabled={assignmentBusy} onPress={() => navigateDate(today)} accessibilityRole="button" className="min-h-12 justify-center rounded-xl bg-emerald-100 px-5 dark:bg-emerald-950">
        <Text className="font-semibold text-emerald-700 dark:text-emerald-300">Hoy</Text>
      </Pressable>
    </View>
    <View style={{ height: 20 }} className="items-center justify-center">
      {loading && <ActivityIndicator size="small" color="#059669" />}
    </View>
    <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <View className="flex-row bg-[#111A1A]">{WEEKDAYS.map((day) => <Text key={day} className="flex-1 py-3 text-center text-xs font-semibold text-white">{day}</Text>)}</View>
      {rows.map((row, index) => <View key={index} className={index ? "flex-row border-t border-gray-200 dark:border-gray-700" : "flex-row"}>
        {row.map((day, column) => {
          if (!day) return <View key={`empty-${column}`} style={{ minHeight: 106 }} className="flex-1 border-r border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950" />;
          const { shifts, offDays, drafts } = grouped.get(day)!;
          const visibleDrafts = [...drafts].sort((a, b) => Number(b.workShiftTypeId === selectedType?.id) - Number(a.workShiftTypeId === selectedType?.id));
          const entries = [
            ...visibleDrafts.map((draft) => ({ key: `draft-${draft.date}-${draft.workShiftTypeId}`, name: draft.name, icon: draft.icon, iconColor: draft.iconColor, detail: draft.allDay ? "Todo el día" : formatTime(draft.startsAt), color: draft.color, inactive: false, status: null, pending: true })),
            ...shifts.map((shift) => ({ key: `shift-${shift.id}`, name: shift.name ?? "Trabajo", icon: shift.icon, iconColor: shift.iconColor, detail: formatTime(shift.startsAt), color: shift.color ?? "#2563EB", inactive: shift.status === "CANCELLED", status: shiftStatus(shift, now), pending: false })),
            ...offDays.map((item) => ({ key: `off-${item.id}`, name: item.name, icon: item.icon, iconColor: item.iconColor, detail: "Todo el día", color: item.color, inactive: !item.isActive, status: null, pending: false })),
          ];
          const marked = editing ? pendingAssignments.some((item) => item.date === day && item.type.id === selectedType?.id) : dayDetailsOpen && day === selectedDay;
          return <Pressable key={day} disabled={assignmentBusy || loading || !calendar} accessibilityRole="button" accessibilityLabel={`${dateLabel(day)}. ${entries.map((item) => `${item.name}${item.pending ? ", pendiente de guardar" : ""}`).join(". ")}${marked ? ". Seleccionado" : ""}${day === today ? ". Hoy" : ""}`}
            accessibilityState={{ selected: marked }}
            onPress={() => {
              setSelectedDay(day);
              if (!editing) setDayDetailsOpen(true);
              if (editing) toggleDayAssignment(day);
            }}
            style={{ minHeight: view === "week" ? 136 : 106 }}
            className={`min-w-0 flex-1 gap-1 border-r border-gray-100 px-0.5 pb-1 dark:border-gray-800 ${marked ? "bg-emerald-50 dark:bg-emerald-950" : ""}`}>
            <View className="flex-row items-center justify-center gap-1 py-1">
              <View className={`h-7 w-7 items-center justify-center rounded-full ${day === today ? "bg-emerald-600" : ""}`}>
                <Text className={`text-xs font-bold ${day === today ? "text-white" : "text-gray-950 dark:text-white"}`}>{Number(day.slice(8))}</Text>
              </View>
            </View>
            {entries.slice(0, 2).map((item) => <View key={item.key} style={{ borderColor: item.color, backgroundColor: `${item.color}12`, opacity: item.inactive ? 0.45 : 1, borderStyle: item.pending ? "dashed" : "solid", borderWidth: item.pending ? 1 : 0 }} className="items-center gap-0.5 rounded-lg px-0.5 py-1">
              <JourneyIcon icon={item.icon} color={item.color} iconColor={item.iconColor} size={24} />
              <Text numberOfLines={1} className="w-full text-center text-[9px] font-semibold text-gray-950 dark:text-white">{item.name}</Text>
              <View className="flex-row items-center gap-0.5">
                <Text numberOfLines={1} className="flex-1 text-[9px] text-gray-600 dark:text-gray-300">{item.detail}</Text>
                {item.pending ? <Ionicons name="pencil-outline" size={10} color="#059669" /> : item.status && <Ionicons name={item.status.icon} size={11} color={item.status.color} />}
              </View>
            </View>)}
            {entries.length > 2 && <Text className="text-center text-[9px] text-gray-500 dark:text-gray-400">+{entries.length - 2}</Text>}
          </Pressable>;
        })}
      </View>)}
    </View>
  </View>;
}
