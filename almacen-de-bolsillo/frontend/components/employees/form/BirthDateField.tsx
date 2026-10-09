import { useState } from "react";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Keyboard, Modal, Platform, Pressable, Text, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { birthDateInputToIso, dateToLocalIso, formatBirthDateDisplay, formatBirthDateInput } from "@almacen/shared";
import { AuthField } from "@/components/auth/AuthField";
import { AuthButton } from "@/components/auth/AuthButton";

type Props = { value: string; onChange: (value: string) => void; disabled: boolean };

export function BirthDateField({ value, onChange, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(2000, 0, 1, 12));
  const isDark = useColorScheme() === "dark";

  const openCalendar = () => {
    Keyboard.dismiss();
    const iso = birthDateInputToIso(value);
    const initial = iso ? new Date(`${iso}T12:00:00`) : new Date(2000, 0, 1, 12);
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({ value: initial, mode: "date", display: "calendar", maximumDate: new Date(),
        onValueChange: (_event, date) => { if (date) onChange(formatBirthDateDisplay(dateToLocalIso(date))); } });
    } else {
      setSelectedDate(initial);
      setIsOpen(true);
    }
  };

  return (
    <View>
      <View className="flex-row items-end gap-2">
        <View className="flex-1">
          <AuthField label="Fecha de nacimiento" value={value} placeholder="DD/MM/AAAA" keyboardType="number-pad"
            editable={!disabled} maxLength={10} onChangeText={(text) => onChange(formatBirthDateInput(text, value))} />
        </View>
        <Pressable disabled={disabled} onPress={openCalendar} accessibilityRole="button" accessibilityLabel="Elegir fecha de nacimiento"
          className="h-12 w-12 items-center justify-center rounded-xl border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
        </Pressable>
      </View>
      <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">Escribí día, mes y año o elegí una fecha en el calendario.</Text>
      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsOpen(false)}>
        <SafeAreaView className="flex-1 gap-5 bg-gray-50 p-4 dark:bg-black">
          <Text className="text-xl font-bold text-gray-950 dark:text-white">Fecha de nacimiento</Text>
          <DateTimePicker value={selectedDate} mode="date" display="inline" maximumDate={new Date()}
            themeVariant={isDark ? "dark" : "light"} style={{ height: 370 }}
            onValueChange={(_event, date) => { if (date) setSelectedDate(date); }} />
          <AuthButton label="Usar esta fecha" onPress={() => {
            onChange(formatBirthDateDisplay(dateToLocalIso(selectedDate))); setIsOpen(false);
          }} />
          <AuthButton label="Cancelar" secondary onPress={() => setIsOpen(false)} />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
