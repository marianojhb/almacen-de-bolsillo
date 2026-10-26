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
        <View className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <Text className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
                Buscar
            </Text>
            <TextInput
                value={search}
                onChangeText={onSearchChange}
                placeholder="Buscar por nombre, código o DNI"
                placeholderTextColor="#94a3b8"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
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
                className={`flex-1 items-center rounded-full border px-3 py-2 active:opacity-70 ${
                    isSelected
                    ? "border-[#111A1A] bg-[#111A1A] dark:border-white dark:bg-white"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                }`}
            >
                <Text
                    className={`font-semibold ${
                        isSelected
                        ? "text-white dark:text-black"
                        : "text-slate-700 dark:text-slate-200"
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
