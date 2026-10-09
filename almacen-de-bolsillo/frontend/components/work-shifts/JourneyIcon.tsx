import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { shiftIcon } from "./work-shift-calendar.utils";

type Props = { icon: string | null; color: string | null; iconColor?: string; size?: number };

export function JourneyIcon({ icon, color, iconColor = "#FFFFFF", size = 40 }: Props) {
  const circleColor = color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#2563EB";
  return (
    <View style={{ width: size, height: size, backgroundColor: circleColor }}
      className="items-center justify-center rounded-full">
      <Ionicons name={shiftIcon(icon)} size={Math.round(size * 0.53)} color={iconColor === "#000000" ? "#000000" : "#FFFFFF"} />
    </View>
  );
}
