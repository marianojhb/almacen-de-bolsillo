import type { ReactNode } from "react";
import { Modal, ScrollView, Text, View } from "react-native";

type Props = { visible: boolean; title: string; onClose: () => void; children: ReactNode; scrollEnabled?: boolean };

export function WorkShiftDialog({ visible, title, onClose, children, scrollEnabled = true }: Props) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View className="flex-1 items-center justify-center bg-black/60 p-6">
      <View accessibilityViewIsModal style={{ maxWidth: 380, maxHeight: "80%" }} className="w-full rounded-3xl bg-white p-5 dark:bg-gray-900">
        <ScrollView scrollEnabled={scrollEnabled} bounces={scrollEnabled} style={{ flexGrow: 0 }} contentContainerClassName="gap-4" keyboardShouldPersistTaps="handled">
          <Text className="text-xl font-bold text-gray-950 dark:text-white">{title}</Text>
          {children}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
