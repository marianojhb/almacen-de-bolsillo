import { router, useLocalSearchParams, type Href } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { WorkShiftTypeForm } from "@/components/work-shifts/form/WorkShiftTypeForm";
import { useWorkShifts } from "@/contexts/work-shifts";
import { usePermissions } from "@/hooks/usePermissions";

export default function JourneyScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { workShiftTypes, isLoading, error, addWorkShiftType, updateWorkShiftType } = useWorkShifts();
  const { can } = usePermissions();
  const editing = id !== undefined;
  const allowed = can("workShiftTypes", editing ? "update" : "create");
  const journey = workShiftTypes.find((item) => item.id === Number(id));
  function close() {
    if (router.canGoBack()) router.back();
    else router.replace("/more/work-shifts" as Href);
  }
  if (!allowed) return <Text className="p-4 text-red-600">No tenés permiso para esta operación.</Text>;
  if (isLoading) return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;
  if (error || (editing && !journey)) return <Text className="p-4 text-red-600">{error ?? "Jornada no encontrada."}</Text>;
  return <WorkShiftTypeForm key={id ?? "new"} initialValues={journey} onCancel={close} onSubmit={async (data) => {
    if (journey) await updateWorkShiftType(journey.id, data);
    else await addWorkShiftType(data);
    close();
  }} />;
}
