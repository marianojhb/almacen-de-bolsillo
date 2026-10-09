import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { AuthButton } from "@/components/auth/AuthButton";
import { JourneyIcon } from "../JourneyIcon";
import { WorkShiftDialog } from "../WorkShiftDialog";
import { clampColor, hexToJourneyColor, journeyColorToHex } from "./color-picker.utils";

type Props = { color: string; icon: string; iconColor: string; disabled?: boolean; onChange: (color: string) => void };

export function JourneyColorPicker({ color, icon, iconColor, disabled, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const close = () => { setDragging(false); setOpen(false); };
  const dragHandlers = {
    onTouchStart: () => setDragging(true),
    onTouchEnd: () => setDragging(false),
    onTouchCancel: () => setDragging(false),
    onStartShouldSetResponderCapture: () => true,
    onMoveShouldSetResponderCapture: () => true,
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderTerminationRequest: () => false,
    onResponderRelease: () => setDragging(false),
    onResponderTerminate: () => setDragging(false),
  };
  const [draft, setDraft] = useState(() => hexToJourneyColor(color));
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [hueWidth, setHueWidth] = useState(1);
  const selectedColor = journeyColorToHex(draft);
  const shades = useMemo(() => Array.from({ length: 24 }, (_, row) =>
    Array.from({ length: 24 }, (_, column) => journeyColorToHex({ hue: draft.hue, saturation: column / 23, brightness: 1 - row / 23 }))), [draft.hue]);
  const chooseShade = (x: number, y: number) => setDraft((current) => ({ ...current,
    saturation: clampColor(x / size.width), brightness: 1 - clampColor(y / size.height) }));
  return <>
    <Pressable disabled={disabled} accessibilityRole="button" accessibilityLabel="Elegir color personalizado"
      onPress={() => { setDraft(hexToJourneyColor(color)); setDragging(false); setOpen(true); }} className="h-11 w-11 items-center justify-center rounded-full border border-gray-300 dark:border-gray-600"
      style={{ backgroundColor: color }}>
      <Ionicons name="pencil" size={21} color={iconColor} />
    </Pressable>
    <WorkShiftDialog visible={open} title="Color de la jornada" onClose={close} scrollEnabled={!dragging}>
      <View className="items-center gap-2">
        <JourneyIcon icon={icon} color={selectedColor} iconColor={iconColor} size={56} />
      </View>
      <View style={{ height: 190 }} className="relative overflow-hidden rounded-xl"
        onLayout={(event) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
        {...dragHandlers}
        onResponderGrant={(event) => { setDragging(true); chooseShade(event.nativeEvent.locationX, event.nativeEvent.locationY); }}
        onResponderMove={(event) => chooseShade(event.nativeEvent.locationX, event.nativeEvent.locationY)}>
        <View pointerEvents="none" style={{ flex: 1 }}>
          {shades.map((row, i) => <View key={i} style={{ flex: 1, flexDirection: "row" }}>
            {row.map((shade, j) => <View key={j} style={{ flex: 1, backgroundColor: shade }} />)}
          </View>)}
        </View>
        <View pointerEvents="none" style={{ position: "absolute", left: draft.saturation * size.width - 9, top: (1 - draft.brightness) * size.height - 9,
          width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: "#FFFFFF", backgroundColor: selectedColor }} />
      </View>
      <View accessibilityRole="adjustable" accessibilityLabel="Tono del color" accessibilityValue={{ min: 0, max: 360, now: Math.round(draft.hue) }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => setDraft((current) => ({ ...current,
          hue: (current.hue + (event.nativeEvent.actionName === "increment" ? 10 : -10) + 360) % 360 }))}
        style={{ height: 28 }} className="relative overflow-hidden rounded-full"
        onLayout={(event) => setHueWidth(event.nativeEvent.layout.width)}
        {...dragHandlers}
        onResponderGrant={(event) => { setDragging(true); setDraft({ ...draft, hue: clampColor(event.nativeEvent.locationX / hueWidth) * 359.99 }); }}
        onResponderMove={(event) => setDraft({ ...draft, hue: clampColor(event.nativeEvent.locationX / hueWidth) * 359.99 })}>
        <View pointerEvents="none" style={{ flex: 1, flexDirection: "row" }}>
          {Array.from({ length: 48 }, (_, index) => <View key={index} style={{ flex: 1,
            backgroundColor: journeyColorToHex({ hue: index / 47 * 359.99, saturation: 1, brightness: 1 }) }} />)}
        </View>
        <View pointerEvents="none" style={{ position: "absolute", left: draft.hue / 360 * hueWidth - 5, width: 10, height: 28, borderWidth: 2, borderColor: "#FFFFFF", borderRadius: 5 }} />
      </View>
      <Text className="text-center text-xs text-gray-500 dark:text-gray-400">Deslizá para elegir el tono y la intensidad.</Text>
      <AuthButton label="Usar color" onPress={() => { onChange(selectedColor); close(); }} />
      <AuthButton label="Cancelar" secondary onPress={close} />
    </WorkShiftDialog>
  </>;
}
