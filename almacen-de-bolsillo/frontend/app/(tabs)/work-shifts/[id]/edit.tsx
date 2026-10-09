import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { WorkShiftForm } from "@/components/work-shifts/form/WorkShiftForm";
export default function EditWorkShiftScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shiftId = Number(id);
  if (!Number.isSafeInteger(shiftId) || shiftId < 1) return <Text>El turno no es válido.</Text>;
  return <WorkShiftForm key={shiftId} shiftId={shiftId} />;
}
