import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { AuthButton } from "@/components/auth/AuthButton";
import { useWorkShifts } from "@/contexts/work-shifts";
import { JourneyIcon } from "../JourneyIcon";
import { WorkShiftDialog } from "../WorkShiftDialog";

export function AssignmentPanel() {
  const router = useRouter();
  const { canManage, types, editing, selectedTypeId, chooseType, setSelectedTypeId, setEditing,
    pendingAssignments, setPendingAssignments, calendar, loading, assignmentBusy: busy,
    assignmentWarning, setAssignmentWarning, setAssignmentNotice, setDayDetailsOpen } = useWorkShifts();
  const [discarding, setDiscarding] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!editing) { progress.setValue(0); return; }
    const animation = Animated.timing(progress, { toValue: 1, duration: 220, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [editing, progress]);

  const discard = () => {
    setPendingAssignments([]); setSelectedTypeId(""); setEditing(false); setDiscarding(false);
  };
  const close = () => {
    if (busy) return;
    if (pendingAssignments.length) setDiscarding(true);
    else discard();
  };
  if (!canManage) return null;
  return <View className="gap-1">
    {!editing ? <View className="items-end">
      <Pressable disabled={!calendar || loading || busy} accessibilityRole="button" accessibilityLabel="Editar calendario"
        onPress={() => { setAssignmentNotice(null); setDayDetailsOpen(false); setEditing(true); }}
        className={`h-14 w-14 items-center justify-center rounded-full bg-[#111A1A] shadow-md ${!calendar || loading ? "opacity-40" : ""}`}>
        <Ionicons name="pencil" size={25} color="#FFFFFF" />
      </Pressable>
    </View> : <>
      <View className="items-end">
        <Pressable disabled={busy} accessibilityRole="button" accessibilityLabel="Cerrar edición" hitSlop={8}
          onPress={close} className="h-7 w-7 items-center justify-center rounded-full bg-[#111A1A]">
          <Ionicons name="close" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
      <Animated.View style={{ alignSelf: "flex-end", width: progress.interpolate({ inputRange: [0, 1], outputRange: ["18%", "100%"] }) }}
        className="overflow-hidden rounded-full bg-[#111A1A] shadow-md">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 9, gap: 4 }}>
          {types.filter((type) => type.isActive).map((type) => {
            const selected = selectedTypeId === String(type.id);
            return <Pressable key={type.id} disabled={busy} accessibilityRole="button" accessibilityLabel={`Jornada ${type.name}`}
              accessibilityState={{ selected }} onPress={() => chooseType(String(type.id))}
              className="w-20 items-center justify-center gap-1 px-1">
              <View className="relative">
                <JourneyIcon icon={type.icon} color={type.color} iconColor={type.iconColor} size={30} />
                {selected && <View className="absolute -bottom-1 -right-1 h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                  <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                </View>}
              </View>
              <Text numberOfLines={1} ellipsizeMode="tail" className="w-full text-center text-[11px] font-semibold text-white">{type.name}</Text>
            </Pressable>;
          })}
          <Pressable disabled={busy} accessibilityRole="button" accessibilityLabel="Crear nueva jornada"
            onPress={() => router.push("/work-shifts/types/new" as Href)} className="w-28 items-center justify-center gap-1 px-1">
            <View className="h-[30px] w-[30px] items-center justify-center"><Ionicons name="add" size={28} color="#FFFFFF" /></View>
            <Text numberOfLines={1} className="text-center text-[11px] font-semibold text-white">Nueva jornada</Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </>}
    <WorkShiftDialog visible={discarding} title="¿Descartar asignaciones?" onClose={() => setDiscarding(false)}>
      <Text className="text-gray-600 dark:text-gray-300">Tenés cambios sin guardar.</Text>
      <AuthButton label="Seguir editando" onPress={() => setDiscarding(false)} />
      <AuthButton label="Descartar cambios" secondary onPress={discard} />
    </WorkShiftDialog>
    <WorkShiftDialog visible={!!assignmentWarning} title="No se puede asignar" onClose={() => setAssignmentWarning(null)}>
      <Text accessibilityRole="alert" className="text-gray-600 dark:text-gray-300">{assignmentWarning}</Text>
      <AuthButton label="Entendido" onPress={() => setAssignmentWarning(null)} />
    </WorkShiftDialog>
  </View>;
}
