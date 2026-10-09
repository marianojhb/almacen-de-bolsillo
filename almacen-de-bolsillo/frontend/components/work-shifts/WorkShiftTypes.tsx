import { useState } from "react";
import { useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthButton } from "@/components/auth/AuthButton";
import { DeleteRecordButton } from "@/components/DeleteRecordButton";
import { AuthField } from "@/components/auth/AuthField";
import { useWorkShifts } from "@/contexts/work-shifts";
import { deleteWorkShiftTypeRequest, updateWorkShiftTypeRequest } from "@/services/workShiftsApi";
import type { WorkShiftTypeDto } from "@almacen/shared";
import { WorkShiftDialog } from "./WorkShiftDialog";
import { ToggleField } from "./form/BreakEditor";
import { JourneyIcon } from "./JourneyIcon";

export function WorkShiftTypes() {
  const router = useRouter();
  const { types, canManage, refreshOptions, refreshCalendar, selectedTypeId, setSelectedTypeId } = useWorkShifts();
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const changeStatus = async (type: WorkShiftTypeDto) => {
    if (busyId !== null) return;
    setBusyId(type.id);
    try { await updateWorkShiftTypeRequest(type.id, { isActive: !type.isActive }); await refreshOptions(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo actualizar la jornada."); }
    finally { setBusyId(null); }
  };
  const visibleTypes = types.filter((type) => (type.isActive || showInactive) && type.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return <View className="gap-4">
    {canManage && <AuthButton label="Crear tipo de jornada" onPress={() => router.push("/work-shifts/types/new" as Href)} />}
    <AuthField label="Buscar jornada" placeholder="Nombre de la jornada" value={search} onChangeText={setSearch} />
    {canManage && <ToggleField label="Mostrar jornadas dadas de baja" value={showInactive} onChange={setShowInactive} />}
    {visibleTypes.map((type) => <View key={type.id} className="gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <Pressable disabled={!canManage || busyId !== null} accessibilityRole={canManage ? "button" : undefined}
        accessibilityLabel={`Editar jornada ${type.name}`} onPress={() => router.push(`/work-shifts/types/${type.id}/edit` as Href)}
        className="min-h-16 flex-row items-center gap-3 active:opacity-70">
        <JourneyIcon icon={type.icon} color={type.color} iconColor={type.iconColor} size={46} />
        <View className="flex-1"><Text numberOfLines={1} className="text-lg font-bold text-gray-950 dark:text-white">{type.name}{!type.isActive ? " · De baja" : ""}</Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">{type.isWorkingDay ? "Laboral" : "No laboral"} · {!type.isWorkingDay ? "Todo el día" : `${type.startTime}–${type.endTime}${type.endsNextDay ? " (+1 día)" : ""}`}</Text>
          {type.breaks.length > 0 && <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">{type.breaks.length} descansos: {type.breaks.map((item) => item.mode === "FLEXIBLE" ? `${item.durationMinutes} min flexibles` : `${item.startTime}–${item.endTime}`).join(" · ")}</Text>}
        </View>
        {canManage && <Ionicons name="chevron-forward" size={22} color="#64748B" />}
      </Pressable>
      {canManage && <View className="gap-2">
        <AuthButton label={type.isActive ? "Dar de baja" : "Dar de alta"} secondary loading={busyId === type.id}
          disabled={busyId !== null} onPress={() => void changeStatus(type)} />
        <DeleteRecordButton name={type.name} disabled={busyId !== null}
          description="Solo se puede eliminar si no tiene asignaciones ni historial, incluso cancelado. Si ya se usó, podés darla de baja."
          onBusyChange={(busy) => setBusyId(busy ? type.id : null)} onDelete={async () => {
            await deleteWorkShiftTypeRequest(type.id);
            if (selectedTypeId === String(type.id)) setSelectedTypeId("");
            await refreshOptions();
            await refreshCalendar();
          }} />
      </View>}
    </View>)}
    {!visibleTypes.length && <Text className="py-8 text-center text-gray-500 dark:text-gray-400">No hay tipos de jornada para mostrar.</Text>}
    <WorkShiftDialog visible={!!error} title="No se pudo actualizar" onClose={() => setError(null)}>
      <Text className="text-gray-600 dark:text-gray-300">{error}</Text>
      <AuthButton label="Entendido" onPress={() => setError(null)} />
    </WorkShiftDialog>
  </View>;
}
