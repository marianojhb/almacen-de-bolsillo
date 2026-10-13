import type { WorkShift } from "@almacen/shared";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WorkShiftForm } from "@/components/work-shifts/form/WorkShiftForm";
import { useWorkShifts } from "@/contexts/work-shifts";
import { usePermissions } from "@/hooks/usePermissions";
import { getWorkShiftByIdRequest } from "@/services/workShiftsApi";

export default function ShiftScreen() {
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const { workShifts, updateWorkShift, addWorkShifts } = useWorkShifts();
  const { can } = usePermissions();
  const editing = id !== undefined;
  const validId = !editing || (typeof id === "string" && /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0);
  const allowed = can("workShifts", editing ? "update" : "create");
  const localShift = workShifts.find((item) => item.id === Number(id));
  const [remoteShift, setRemoteShift] = useState<WorkShift | null>(null);
  const [failure, setFailure] = useState<{ id: string; message: string } | null>(null);
  const shift = localShift ?? (remoteShift?.id === Number(id) ? remoteShift : undefined);

  useEffect(() => {
    if (!id || !validId || !allowed || localShift) return;
    let active = true;
    void getWorkShiftByIdRequest(Number(id)).then((item) => {
      if (active) setRemoteShift(item);
    }).catch((cause: unknown) => {
      if (active) setFailure({ id, message: cause instanceof Error ? cause.message : "No se pudo cargar el turno." });
    });
    return () => { active = false; };
  }, [id, validId, allowed, localShift]);

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace("/more/work-shifts" as Href);
  }

  const message = !allowed ? "No tenés permiso para esta operación." : !validId ? "Turno inválido." : editing && !shift && failure?.id === id ? failure.message : null;
  if (message) return <View className="flex-1 bg-gray-50 p-4 dark:bg-black"><Text className="text-red-600">{message}</Text></View>;
  if (editing && !shift) return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;
  return (
    <WorkShiftForm key={id ?? "new"} editing={editing} initialValues={shift ? {
      employeeId: shift.employeeId, workShiftTypeId: shift.workShiftTypeId, date: shift.date, notes: shift.notes,
    } : { date }} onCancel={close} onSubmit={async (data) => {
      if (editing) {
        await updateWorkShift(Number(id), data[0]!);
        close();
        return { savedDates: [data[0]!.date], failures: [] };
      }
      const result = await addWorkShifts(data);
      if (result.failures.length === 0) close();
      return result;
    }} />
  );
}
