import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { validateWorkShiftType, type WorkShiftTimeBlock, type WorkShiftTypeData } from "@almacen/shared";
import { AuthField } from "@/components/auth/AuthField";
import { AuthButton } from "@/components/auth/AuthButton";
import { useWorkShifts } from "@/contexts/work-shifts";
import { createWorkShiftTypeRequest, getWorkShiftTypeRequest, updateWorkShiftTypeRequest } from "@/services/workShiftsApi";
import { SHIFT_COLORS, SHIFT_ICONS, automaticBreakDays, automaticTimeBlock, formatMinutes } from "../work-shift-calendar.utils";
import { JourneyIcon } from "../JourneyIcon";
import { CalendarField } from "./CalendarField";
import { BreakEditor, ToggleField } from "./BreakEditor";
import { JourneyColorPicker } from "./JourneyColorPicker";
import { breakValidationMessage } from "./break-editor.utils";

const initialData: WorkShiftTypeData = {
  name: "", icon: "sunny-outline", iconColor: "#FFFFFF", color: "#2563EB", isWorkingDay: true,
  startTime: "08:00", endTime: "12:00", endsNextDay: false, breaks: [], lateToleranceMinutes: 0,
};

export function WorkShiftTypeForm({ typeId }: { typeId?: number }) {
  const router = useRouter();
  const { canManage, refreshOptions, refreshCalendar, setSelectedTypeId } = useWorkShifts();
  const [data, setData] = useState<WorkShiftTypeData>(initialData);
  const [loading, setLoading] = useState(typeId !== undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [keepFullDay, setKeepFullDay] = useState(false);
  const [toleranceEnabled, setToleranceEnabled] = useState(false);
  const [toleranceText, setToleranceText] = useState("10");
  const busy = useRef(false);

  useEffect(() => {
    if (typeId === undefined) return;
    let active = true;
    void getWorkShiftTypeRequest(typeId).then((type) => {
      if (!active) return;
      const { name, icon, iconColor, color, isWorkingDay, startTime, endTime, endsNextDay, breaks, lateToleranceMinutes } = type;
      setData({ name, icon, iconColor, color, isWorkingDay, startTime, endTime, endsNextDay, breaks, lateToleranceMinutes });
      setToleranceEnabled(lateToleranceMinutes > 0);
      setToleranceText(String(lateToleranceMinutes || 10));
      setKeepFullDay(isWorkingDay && endsNextDay && startTime === endTime);
    }).catch((reason) => { if (active) setLoadError(reason instanceof Error ? reason.message : "No se pudo cargar la jornada."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [typeId]);

  let block: WorkShiftTimeBlock | null = null;
  let scheduleError: string | null = null;
  if (data.isWorkingDay) {
    try {
      block = automaticTimeBlock(data.startTime ?? "", data.endTime ?? "", keepFullDay);
    } catch (reason) {
      scheduleError = reason instanceof Error ? reason.message : "Revisá el horario de la jornada.";
    }
  }
  const endsNextDay = block?.endsNextDay ?? false;
  const start = (block?.startTime ?? "").split(":").map(Number);
  const end = (block?.endTime ?? "").split(":").map(Number);
  const duration = end[0] * 60 + end[1] - start[0] * 60 - start[1] + (endsNextDay ? 1440 : 0);
  const breakError = block ? breakValidationMessage(block, data.breaks) : scheduleError;

  const save = async () => {
    if (busy.current || !canManage || loadError) return;
    setError(null);
    let payload: WorkShiftTypeData;
    try {
      if (scheduleError) throw new Error(scheduleError);
      if (data.isWorkingDay && toleranceEnabled && (!/^\d+$/.test(toleranceText) || Number(toleranceText) < 1)) {
        throw new Error("Ingresá una cantidad entera y positiva de minutos de tolerancia.");
      }
      payload = { ...data,
        lateToleranceMinutes: data.isWorkingDay && toleranceEnabled ? Number(toleranceText) : 0,
        name: data.name.trim(), color: data.color.toUpperCase(),
        endsNextDay: block?.endsNextDay ?? false,
        breaks: data.isWorkingDay && block ? automaticBreakDays(block, data.breaks) : [],
      };
      if (!payload.name || payload.name.length > 24) throw new Error("Escribí un nombre de hasta 24 caracteres.");
      if (!/^#[0-9A-F]{6}$/.test(payload.color)) throw new Error("El color debe tener formato #RRGGBB.");
      validateWorkShiftType(payload);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Revisá los datos."); return; }
    busy.current = true;
    setSaving(true);
    try {
      const result = typeId === undefined ? await createWorkShiftTypeRequest(payload) : await updateWorkShiftTypeRequest(typeId, payload);
      if (result.isActive) setSelectedTypeId(String(result.id));
      await refreshOptions();
      await refreshCalendar();
      router.dismissTo("/work-shifts" as Href);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar la jornada.");
      busy.current = false;
      setSaving(false);
    }
  };

  if (!canManage) return <Text className="p-4 text-gray-500">No tenés permiso para gestionar jornadas.</Text>;
  if (loading) return <ActivityIndicator className="mt-8" size="large" color="#9ca3af" />;
  if (loadError) return <Text accessibilityRole="alert" className="p-4 text-red-600">{loadError}</Text>;
  const changeScheduleMode = (isWorkingDay: boolean) => {
    setKeepFullDay(false);
    setToleranceEnabled(false);
    setToleranceText("10");
    setData({ ...data, isWorkingDay,
      lateToleranceMinutes: 0,
      startTime: isWorkingDay ? "08:00" : null, endTime: isWorkingDay ? "12:00" : null, endsNextDay: false, breaks: [],
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-black" contentContainerClassName="gap-5 p-4 pb-10" keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <View className="flex-row items-center gap-3 rounded-2xl bg-white p-4 dark:bg-gray-900">
        <JourneyIcon icon={data.icon} color={data.color} iconColor={data.iconColor} size={48} />
        <View className="flex-1 gap-1">
          <Text className="text-lg font-bold text-gray-950 dark:text-white">{data.name.trim() || "Nueva jornada"}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{!data.isWorkingDay ? "No laboral · Todo el día" : `${data.startTime || "Inicio"}–${data.endTime || "Fin"}${endsNextDay ? " · Día siguiente" : ""}`}</Text>
        </View>
      </View>
      {typeId === undefined && <View className="gap-2">
        <Text className="font-semibold text-gray-950 dark:text-white">Ejemplos opcionales</Text>
        <View className="flex-row flex-wrap gap-2">
          {[{ name: "Descanso", icon: "bed-outline", color: "#059669" }, { name: "Vacaciones", icon: "airplane-outline", color: "#7C3AED" }, { name: "Día no laboral", icon: "calendar-outline", color: "#D97706" }].map((preset) => (
            <Pressable key={preset.name} disabled={saving} onPress={() => { setKeepFullDay(false); setToleranceEnabled(false); setToleranceText("10"); setData({ ...initialData, ...preset, isWorkingDay: false, startTime: null, endTime: null }); }}
              className="min-h-11 justify-center rounded-xl border border-gray-300 px-3 dark:border-gray-700">
              <Text className="text-gray-950 dark:text-white">{preset.name}</Text>
            </Pressable>
          ))}
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400">Solo se guardan al confirmar. Podés cambiar todos sus datos.</Text>
      </View>}
      <AuthField label="Nombre de la jornada" placeholder="Ej.: Mañana, tarde o vacaciones" value={data.name} maxLength={24} editable={!saving} onChangeText={(name) => setData({ ...data, name })} />
      <View className="gap-3">
        <Text className="font-semibold text-gray-950 dark:text-white">Icono</Text>
        <View className="flex-row flex-wrap gap-2">
          {SHIFT_ICONS.map((icon) => <Pressable key={icon} disabled={saving} accessibilityRole="radio" accessibilityLabel={`Icono ${icon}`} accessibilityState={{ checked: data.icon === icon }}
            onPress={() => setData({ ...data, icon })} className={`h-14 w-14 items-center justify-center rounded-2xl border-2 ${data.icon === icon ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950" : "border-transparent"}`}>
            <JourneyIcon icon={icon} color={data.color} iconColor={data.iconColor} size={40} />
          </Pressable>)}
        </View>
      </View>
      <View className="gap-3">
        <Text className="font-semibold text-gray-950 dark:text-white">Color del icono</Text>
        <View className="flex-row gap-3">
          {[{ color: "#000000", label: "Negro" }, { color: "#FFFFFF", label: "Blanco" }].map((option) => <Pressable key={option.color}
            disabled={saving} accessibilityRole="radio" accessibilityState={{ checked: data.iconColor === option.color }}
            onPress={() => setData({ ...data, iconColor: option.color })}
            className={`min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl border ${data.iconColor === option.color ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950" : "border-gray-300 dark:border-gray-700"}`}>
            <View style={{ backgroundColor: option.color }} className="h-5 w-5 rounded-full border border-gray-400" />
            <Text className="font-semibold text-gray-950 dark:text-white">{option.label}</Text>
          </Pressable>)}
        </View>
      </View>
      <View className="gap-3">
        <Text className="font-semibold text-gray-950 dark:text-white">Color del círculo</Text>
        <View className="flex-row flex-wrap gap-3">
          {SHIFT_COLORS.map((color) => <Pressable key={color} disabled={saving} accessibilityRole="radio" accessibilityLabel={`Color ${color}`} accessibilityState={{ checked: data.color.toUpperCase() === color }}
            onPress={() => setData({ ...data, color })} style={{ backgroundColor: color }} className="h-11 w-11 items-center justify-center rounded-full">
            {data.color.toUpperCase() === color && <Ionicons name="checkmark" size={24} color="#FFFFFF" />}
          </Pressable>)}
          <JourneyColorPicker color={data.color} icon={data.icon} iconColor={data.iconColor} disabled={saving} onChange={(color) => setData({ ...data, color })} />
        </View>
      </View>
      <View className="gap-2 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <Text className="mb-2 font-bold text-gray-950 dark:text-white">Tipo de jornada</Text>
        <View className="mb-2 flex-row gap-2">
          {[{ value: true, label: "Laboral" }, { value: false, label: "No laboral" }].map((option) => <Pressable key={option.label}
            disabled={saving} accessibilityRole="radio" accessibilityState={{ checked: data.isWorkingDay === option.value }}
            onPress={() => { if (data.isWorkingDay !== option.value) changeScheduleMode(option.value); }}
            className={`min-h-12 flex-1 items-center justify-center rounded-xl ${data.isWorkingDay === option.value ? "bg-emerald-600" : "bg-gray-100 dark:bg-gray-800"}`}>
            <Text className={`font-semibold ${data.isWorkingDay === option.value ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>{option.label}</Text>
          </Pressable>)}
        </View>
        <Text className="mb-2 text-xs text-gray-500 dark:text-gray-400">{data.isWorkingDay ? "Tiene horario de trabajo y puede incluir descansos." : "Para descanso, vacaciones o feriados. Ocupa el día completo y no admite jornadas laborales ese día."}</Text>

        {data.isWorkingDay && <>
          <View className="flex-row gap-3">
            <View className="flex-1"><CalendarField label="Inicio" mode="time" value={data.startTime ?? ""} disabled={saving} onChange={(startTime) => { setKeepFullDay(false); setData({ ...data, startTime }); }} /></View>
            <View className="flex-1"><CalendarField label="Fin" mode="time" value={data.endTime ?? ""} disabled={saving} onChange={(endTime) => { setKeepFullDay(false); setData({ ...data, endTime }); }} /></View>
          </View>
          <Text className="text-sm text-gray-500 dark:text-gray-400">Duración del bloque: {Number.isFinite(duration) && duration > 0 ? formatMinutes(duration) : "revisá el inicio y fin"}.</Text>
          {endsNextDay && <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">El horario continúa hasta el día siguiente.</Text>}
        </>}
      </View>
      {data.isWorkingDay && <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <ToggleField label="Tolerancia de llegada tarde" value={toleranceEnabled} disabled={saving} onChange={setToleranceEnabled} />
        {toleranceEnabled && <AuthField label="Minutos de tolerancia" value={toleranceText} keyboardType="number-pad" maxLength={4} editable={!saving}
          onChangeText={(value) => setToleranceText(value.replace(/[^0-9]/g, ""))} />}
      </View>}
      {data.isWorkingDay && <BreakEditor value={data.breaks} shiftStartTime={data.startTime ?? ""} shiftEndTime={data.endTime ?? ""} shiftEndsNextDay={endsNextDay} disabled={saving} onChange={(breaks) => setData({ ...data, breaks })} />}
      {error && <Text accessibilityRole="alert" className="text-red-600 dark:text-red-400">{error}</Text>}
      <AuthButton label="Guardar jornada" loading={saving} disabled={!!breakError} onPress={() => void save()} />
      <AuthButton label="Volver sin guardar" secondary disabled={saving} onPress={() => router.dismissTo("/work-shifts" as Href)} />
    </ScrollView>
  );
}
