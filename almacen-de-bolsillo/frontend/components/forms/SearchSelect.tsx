import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SelectOption = { value: string; label: string; description?: string };
type Props = {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showLabel?: boolean;
};

const normalizeSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function SearchSelect({ label, value, options, onChange, disabled = false, placeholder = "Seleccionar", showLabel = true }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.find((option) => option.value === value);
  const query = normalizeSearch(search.trim());
  const filtered = options.filter((option) => normalizeSearch(`${option.label} ${option.description ?? ""}`).includes(query));

  return (
    <View>
      {showLabel && <Text className="mb-2 font-semibold text-gray-950 dark:text-white">{label}</Text>}
      <Pressable disabled={disabled} accessibilityRole="button" accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        accessibilityState={{ disabled, expanded: isOpen }}
        onPress={() => { setSearch(""); setIsOpen(true); }}
        className={`min-h-12 flex-row items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-3 dark:border-gray-700 dark:bg-gray-900 ${disabled ? "opacity-60" : ""}`}>
        <Text className="flex-1 text-base text-gray-950 dark:text-white">{selected?.label ?? placeholder}</Text>
        {!disabled && <Ionicons name="chevron-down" size={20} color="#9ca3af" />}
      </Pressable>
      <Modal visible={isOpen && !disabled} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsOpen(false)}>
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
          <View className="flex-row items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <Text className="flex-1 text-lg font-bold text-gray-950 dark:text-white">{label}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar selector" onPress={() => setIsOpen(false)} hitSlop={12}>
              <Ionicons name="close" size={26} color="#9ca3af" />
            </Pressable>
          </View>
          <TextInput value={search} onChangeText={setSearch} placeholder="Buscar..." accessibilityLabel={`Buscar ${label.toLowerCase()}`}
            placeholderTextColor="#9ca3af" autoCapitalize="none" autoCorrect={false}
            className="mx-4 my-4 h-12 rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-950 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          <FlatList data={filtered} keyExtractor={(option) => option.value} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets
            contentContainerClassName="gap-2 px-4 pb-6" extraData={value}
            ListEmptyComponent={<Text className="py-8 text-center text-gray-500 dark:text-gray-400">No se encontraron opciones.</Text>}
            renderItem={({ item }) => (
              <Pressable accessibilityRole="radio" accessibilityState={{ checked: item.value === value }}
                onPress={() => { onChange(item.value); setIsOpen(false); }}
                className="flex-row items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-950 dark:text-white">{item.label}</Text>
                  {!!item.description && <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.description}</Text>}
                </View>
                {item.value === value && <Ionicons name="checkmark" size={24} color="#9ca3af" />}
              </Pressable>
            )} />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
