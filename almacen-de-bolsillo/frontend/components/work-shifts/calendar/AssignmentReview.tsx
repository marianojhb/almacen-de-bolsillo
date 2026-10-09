import { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { WorkShiftAssignmentBatchPreview } from "@almacen/shared";
import { AuthButton } from "@/components/auth/AuthButton";
import { useWorkShifts } from "@/contexts/work-shifts";
import { useCommerceFormat } from "@/hooks/use-commerce-format";
import { assignWorkShiftTypesRequest, previewWorkShiftAssignmentsRequest } from "@/services/workShiftsApi";
import { dateLabel, groupAssignments } from "../work-shift-calendar.utils";
import { groupAssignmentPreview, shiftTimeRange } from "../work-shift-details.utils";
import { JourneyIcon } from "../JourneyIcon";
import { WorkShiftDialog } from "../WorkShiftDialog";

export function AssignmentReview() {
  const { employeeId, editing, canManage, pendingAssignments, setPendingAssignments, draftSelection,
    calendar, loading, assignmentBusy: busy, setAssignmentBusy: setBusy, setSelectedTypeId,
    setEditing, setAssignmentNotice, refreshCalendar, timeZone } = useWorkShifts();
  const { formatTime } = useCommerceFormat();
  const [preview, setPreview] = useState<WorkShiftAssignmentBatchPreview | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestBusy = useRef(false);
  const mounted = useRef(true);
  const inputKey = JSON.stringify([employeeId, editing, pendingAssignments.map((item) => [item.date, item.type.id, item.type.updatedAt])]);
  const currentInput = useRef(inputKey);
  currentInput.current = inputKey;
  useEffect(() => { setPreview(null); setPreviewOpen(false); setError(null); }, [inputKey]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; setBusy(false); };
  }, [setBusy]);

  const submit = async (action: "save" | "preview") => {
    if (requestBusy.current || !canManage || !employeeId || !pendingAssignments.length || !calendar || loading || draftSelection.error) return;
    requestBusy.current = true; setBusy(true); setError(null); setAssignmentNotice(null);
    const key = currentInput.current;
    try {
      const data = groupAssignments(Number(employeeId), pendingAssignments);
      if (action === "preview") {
        const result = await previewWorkShiftAssignmentsRequest(data);
        if (!mounted.current || key !== currentInput.current) return;
        setPreview(result);
        setPreviewOpen(true);
        return;
      }
      // Guardar valida los conflictos en el servidor dentro de la transacción.
      const result = await assignWorkShiftTypesRequest(data);
      if (!mounted.current || key !== currentInput.current) return;
      setPreview(null); setPreviewOpen(false); setPendingAssignments([]); setSelectedTypeId(""); setEditing(false);
      setAssignmentNotice(`${result.createdCount} asignaciones guardadas correctamente.`);
      await refreshCalendar();
    } catch (reason) {
      if (mounted.current && key === currentInput.current) {
        setPreviewOpen(false);
        setError(reason instanceof Error ? reason.message : "No se pudieron guardar las asignaciones.");
      }
    } finally { requestBusy.current = false; if (mounted.current) setBusy(false); }
  };
  if (!editing || !canManage) return null;
  const disabled = !pendingAssignments.length || !calendar || loading || !!draftSelection.error;
  return <View className="gap-2">
    <View className="flex-row gap-2">
      <View className="flex-1"><AuthButton label="Guardar" loading={busy} disabled={disabled} onPress={() => void submit("save")} /></View>
      <View className="flex-1"><AuthButton label="Previsualizar" secondary disabled={busy || disabled} onPress={() => void submit("preview")} /></View>
    </View>
    <WorkShiftDialog visible={!!error} title="No se guardó ningún cambio" onClose={() => setError(null)}>
      <Text accessibilityRole="alert" className="text-gray-600 dark:text-gray-300">{error}</Text>
      <AuthButton label="Seguir editando" onPress={() => setError(null)} />
    </WorkShiftDialog>
    <Modal visible={previewOpen && preview !== null} presentationStyle="pageSheet" animationType="slide"
      onRequestClose={() => { if (!busy) setPreviewOpen(false); }}>
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
        <ScrollView contentContainerClassName="gap-4 p-4 pb-8">
          <Text className="text-2xl font-bold text-gray-950 dark:text-white">Previsualizar asignaciones</Text>
          <Text className="text-gray-600 dark:text-gray-300">{preview?.employee.name}</Text>
          {preview && groupAssignmentPreview(preview.drafts).map((day) => <View key={day.date} className="gap-4 rounded-2xl bg-white p-4 dark:bg-gray-900">
            <Text className="text-lg font-bold capitalize text-gray-950 dark:text-white">{dateLabel(day.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</Text>
            {day.entries.map(({ draft, index }, position) => <View key={index} className={`gap-2 ${position ? "border-t border-gray-100 pt-4 dark:border-gray-800" : ""}`}>
              <View className="flex-row items-center gap-3">
                <JourneyIcon icon={draft.icon} color={draft.color} iconColor={draft.iconColor} />
                <View className="flex-1 gap-1">
                  <Text className="font-semibold text-gray-950 dark:text-white">{draft.name}</Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-300">{draft.allDay ? "Todo el día" : shiftTimeRange(draft.startsAt!, draft.endsAt!, timeZone)}</Text>
                </View>
              </View>
              {draft.breaks.map((item, breakIndex) => <Text key={breakIndex} className="text-xs text-gray-500 dark:text-gray-400">
                Descanso {breakIndex + 1}: {item.mode === "FLEXIBLE" ? `${item.durationMinutes} min flexibles` : `${formatTime(item.startsAt)}–${formatTime(item.endsAt)}`}
              </Text>)}
              {preview.conflicts.filter((item) => item.draftIndex === index || item.otherDraftIndex === index).map((item, conflictIndex) =>
                <Text key={conflictIndex} className="text-sm text-red-600 dark:text-red-400">{item.message}</Text>)}
            </View>)}
          </View>)}
          <AuthButton label="Guardar asignaciones" loading={busy} disabled={!preview?.canSave || disabled} onPress={() => void submit("save")} />
          <AuthButton label="Volver" secondary disabled={busy} onPress={() => setPreviewOpen(false)} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </View>;
}
