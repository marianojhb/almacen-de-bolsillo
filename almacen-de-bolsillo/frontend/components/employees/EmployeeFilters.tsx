import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

export type EmployeeFilter = "all" | "active" | "inactive";

type EmployeeFiltersProps = {
    search: string;
    onSearchChange: (value: string) => void;
    filter: EmployeeFilter;
    onFilterChange: (value: EmployeeFilter) => void;
};

const filters: { value: EmployeeFilter; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Activos" },
    { value: "inactive", label: "Inactivos" },
];

export function EmployeeFilters({ search, onSearchChange, filter, onFilterChange }: EmployeeFiltersProps) {
    return (
    <>
        <View className="mb-4 flex-row items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
            <Ionicons name="search-outline" size={20} color="#9ca3af" />

            <TextInput
                value={search}
                onChangeText={onSearchChange}
                placeholder="Buscar por nombre, código o DNI"
                placeholderTextColor="#9ca3af"
                className="h-12 flex-1 px-3 text-base text-black dark:text-white"
            />
        </View>

        <View className="mb-4 flex-row gap-2">
            {filters.map((option) => {
            const isSelected = filter === option.value;

            return (
            <Pressable
                key={option.value}
                onPress={() => onFilterChange(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={`flex-1 items-center rounded-xl border px-3 py-2.5 active:opacity-70 ${
                    isSelected
                    ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
                    : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
                }`}
            >
                <Text
                    className={`font-semibold ${
                        isSelected
                        ? "text-white dark:text-black"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                >
                    {option.label}
                </Text>
            </Pressable>
            );
            })}
        </View>
    </>
    );
}