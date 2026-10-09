import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { WorkShiftTypeForm } from "@/components/work-shifts/form/WorkShiftTypeForm";
export default function EditWorkShiftTypeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const typeId = Number(id);
  if (!Number.isSafeInteger(typeId) || typeId < 1) return <Text>El tipo de jornada no es válido.</Text>;
  return <WorkShiftTypeForm key={typeId} typeId={typeId} />;
}
